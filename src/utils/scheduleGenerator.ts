import { Timestamp } from "firebase/firestore";
import { User } from "../types/User";
import { Shift } from "../types/Shift";
import { Post } from "../types/Post";
import { Availability } from "../types/Availability";
import { Posts } from "../constants/Posts";
import { getRoleByPost } from "./getRoleByPost";
import { toISODate } from "./dateUtils";
import { getWeekKeyForShift } from "./getWeekKeyForShift";
import { regenerateShiftId } from "./regenerateShiftId";

export type ScheduleGenerationResult = {
  success: boolean;
  shifts: Map<string, Shift[]>; // userId -> shifts[]
  errors: string[];
  warnings: string[];
};

type ShiftPeriod = 'morning' | 'afternoon' | 'night';

/**
 * Определяет период смены по посту (утро/день/ночь)
 */
function getShiftPeriod(post: Post): ShiftPeriod {
  const postId = post.id.toLowerCase();

  // Проверяем суффикс в ID
  if (postId.includes('-night')) return 'night';
  if (postId.includes('-afternoon')) return 'afternoon';
  if (postId.includes('-morning')) return 'morning';

  // Определяем по времени начала
  const startTime = post.defaultStartTime;
  if (!startTime) return 'morning';

  const [hours] = startTime.split(':').map(Number);

  if (hours >= 21 || hours < 6) return 'night';
  if (hours >= 14) return 'afternoon';
  return 'morning';
}

/**
 * Преобразует период в индекс для availability.statuses
 * [утро=0, день=1, ночь=2]
 */
function periodToIndex(period: ShiftPeriod): number {
  switch (period) {
    case 'morning': return 0;
    case 'afternoon': return 1;
    case 'night': return 2;
  }
}

/**
 * Проверяет, доступен ли пользователь в указанный период дня
 * Если пользователь не отправил запросы для смены (нет availability для этой даты),
 * значит он полностью открыт и доступен для всех периодов
 * Если пользователь отправил запросы, проверяем availability:
 * - true = доступен
 * - false = недоступен
 * - null/undefined = доступен (не указал для этого периода, значит открыт)
 */
function isUserAvailable(user: User, date: Date, period: ShiftPeriod): boolean {
  const dateKey = toISODate(date);

  // Ищем availability для этой конкретной даты
  let availability = null;
  if (user.availability && Array.isArray(user.availability)) {
    for (const av of user.availability) {
      try {
        const avDateKey = toISODate(av.date.toDate());
        if (avDateKey === dateKey) {
          availability = av;
          break;
        }
      } catch (e) {
        // Пропускаем некорректные записи
        continue;
      }
    }
  }

  // КЛЮЧЕВАЯ ЛОГИКА:
  // Если availability НЕТ для этой даты - пользователь доступен везде (как будто везде true)
  // Это значит: он не подал запросы, или подал для других дат - в любом случае доступен
  if (!availability) {
    return true; // НЕ отправил запросы = доступен везде
  }

  // Пользователь ОТПРАВИЛ запросы для этой даты - проверяем только явный отказ
  const periodIndex = periodToIndex(period);

  // Если нет массива статусов или он пустой - считаем доступным
  if (!availability.statuses || !Array.isArray(availability.statuses) || availability.statuses.length === 0) {
    return true; // Нет данных = доступен
  }

  // Получаем статус для периода
  const status = availability.statuses[periodIndex];

  // ЕДИНСТВЕННЫЙ случай когда недоступен - если ЯВНО указан false
  // Все остальное (true, null, undefined, индекс вне массива) = доступен
  if (status === false) {
    return false; // Явно отказался
  }

  // Все остальные случаи - доступен (true, null, undefined)
  return true;
}

/**
 * Проверяет, может ли пользователь работать на этом посту (по ролям)
 */
function canUserWorkPost(user: User, post: Post): boolean {
  const requiredRole = getRoleByPost(post.id);
  if (!requiredRole) return true; // Если роль не определена, разрешаем

  return user.roles.includes(requiredRole);
}

/**
 * Проверяет минимальный перерыв 8 часов между сменами
 */
function hasMinBreakBetweenShifts(
  shift1: { date: Date; endTime: string },
  shift2: { date: Date; startTime: string }
): boolean {
  const end1 = new Date(shift1.date);
  const [endH, endM] = shift1.endTime.split(':').map(Number);
  end1.setHours(endH, endM || 0, 0, 0);

  // Если смена заканчивается рано утром (ночная смена)
  // и время окончания меньше 12:00, то это следующий день
  if (endH < 12) {
    end1.setDate(end1.getDate() + 1);
  }

  const start2 = new Date(shift2.date);
  const [startH, startM] = shift2.startTime.split(':').map(Number);
  start2.setHours(startH, startM || 0, 0, 0);

  // Если вторая смена начинается рано утром и первая закончилась после полуночи,
  // проверяем корректно
  const diffMs = start2.getTime() - end1.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours >= 8;
}

/**
 * Получает дату пятницы для недели, содержащей указанную дату
 */
function getFridayForWeek(date: Date): Date {
  const day = date.getDay(); // 0=Sunday, 5=Friday, 6=Saturday
  const daysUntilFriday = (5 - day + 7) % 7;
  const friday = new Date(date);
  friday.setDate(friday.getDate() + daysUntilFriday);
  friday.setHours(0, 0, 0, 0);
  return friday;
}

/**
 * Проверяет правило шаббата: максимум 3 шаббата подряд, 1 из 4 должен быть свободным
 */
function checkShabbatRule(
  user: User,
  targetWeekStart: Date,
  newShifts: Shift[]
): { valid: boolean; error?: string } {
  // Получаем все смены пользователя (существующие + новые)
  const allUserShifts = [...(user.shifts || []), ...newShifts];

  // Группируем смены по неделям (по пятнице)
  const shiftsByWeek = new Map<string, Shift[]>();

  for (const shift of allUserShifts) {
    const shiftDate = shift.date.toDate();
    const friday = getFridayForWeek(shiftDate);
    const weekKey = toISODate(friday);

    if (!shiftsByWeek.has(weekKey)) {
      shiftsByWeek.set(weekKey, []);
    }
    shiftsByWeek.get(weekKey)!.push(shift);
  }

  // Проверяем, работает ли пользователь в шаббат (пятница или суббота)
  const weeksWithShabbatWork = new Set<string>();

  for (const [weekKey, shifts] of shiftsByWeek.entries()) {
    const friday = new Date(weekKey + 'T00:00:00');
    const saturday = new Date(friday);
    saturday.setDate(friday.getDate() + 1);

    const hasFridayShift = shifts.some(s => {
      const shiftDate = s.date.toDate();
      const shiftDay = shiftDate.getDay();
      return shiftDay === 5; // Friday (0=Sunday, 5=Friday)
    });

    const hasSaturdayShift = shifts.some(s => {
      const shiftDate = s.date.toDate();
      const shiftDay = shiftDate.getDay();
      return shiftDay === 6; // Saturday
    });

    if (hasFridayShift || hasSaturdayShift) {
      weeksWithShabbatWork.add(weekKey);
    }
  }

  // Сортируем недели по дате
  const sortedWeeks = Array.from(weeksWithShabbatWork).sort();

  // Проверяем 4-недельное окно, релевантное для targetWeekStart
  const targetFriday = getFridayForWeek(targetWeekStart);
  const last4Keys: string[] = [];
  for (let i = 3; i >= 0; i--) {
    const wk = new Date(targetFriday);
    wk.setDate(wk.getDate() - i * 7);
    last4Keys.push(toISODate(wk));
  }

  // Если во всех 4 неделях из окна есть работа в шаббат — это нарушение
  const workedAllFour = last4Keys.every(k => weeksWithShabbatWork.has(k));
  if (workedAllFour) {
    return {
      valid: false,
      error: `Пользователь ${user.firstName} ${user.secondName} работает 4 шаббата подряд (недели ${last4Keys[0]} - ${last4Keys[3]}), должен иметь отдых хотя бы на одной неделе из 4`
    };
  }

  return { valid: true };
}

/**
 * Генерирует расписание на неделю
 */
type GenerateOptions = { debug?: boolean; forceFresh?: boolean; debugUser?: string; randomize?: boolean; seed?: number; _consistencyRun?: boolean };

// Простая seeded RNG (Mulberry32)
function mulberry32(a: number) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToInt(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

export function generateSchedule(
  users: User[],
  weekStart: Date,
  targetWeekDates: Date[],
  optionsOrDebug?: boolean | GenerateOptions
): ScheduleGenerationResult {
  // Параметры: исторически четвертый аргумент мог быть boolean (debug)
  const opts = typeof optionsOrDebug === 'boolean' ? { debug: optionsOrDebug } : (optionsOrDebug || {} as GenerateOptions);
  const debug = !!opts.debug;
  const forceFresh = !!opts.forceFresh;
  const debugUser = (opts as GenerateOptions).debugUser as string | undefined;
  const randomizeOpt = (opts as GenerateOptions).randomize;
  const seed = (opts as GenerateOptions).seed;
  const _consistencyRun = !!(opts as GenerateOptions)._consistencyRun;

  // По умолчанию randomize=true, но если debug+forceFresh — выключаем, чтобы тесты были детерминированы
  const randomize = typeof randomizeOpt === 'boolean' ? randomizeOpt : !(debug && forceFresh);

  if (debug) console.log('generateSchedule options:', { debug, forceFresh, debugUser, randomize, seed, _consistencyRun });

  // Снимок существующих смен каждого пользователя (для детерминизма и анализа)
  // Если forceFresh=true - используем пустые массивы (игнорируем сохранённые смены)
  const originalShiftsByUser = new Map<string, Shift[]>();
  for (const u of users) {
    originalShiftsByUser.set(u.id, forceFresh ? [] : [...(u.shifts || [])]);
  }

  if (debug) {
    console.log('Исходные количества смен по пользователям:');
    for (const u of users) {
      console.log(`  ${u.firstName} ${u.secondName}: ${originalShiftsByUser.get(u.id)!.length}`);
    }
  }

  // Если задан debugUser - найдем пользователя и выведем подробный дамп его существующих смен и правила Шаббата
  let debugUserObj: User | undefined = undefined;
  if (debug && debugUser) {
    debugUserObj = users.find(u => u.id === debugUser || `${u.firstName} ${u.secondName}` === debugUser || u.firstName === debugUser || u.secondName === debugUser);
    if (!debugUserObj) {
      console.warn(`DEBUG_USER указан как "${debugUser}", но пользователь не найден среди входного списка`);
    } else {
      console.log(`DEBUG_USER: найден пользователь ${debugUserObj.firstName} ${debugUserObj.secondName} (id=${debugUserObj.id})`);
      const snapshot = originalShiftsByUser.get(debugUserObj.id) || [];
      console.log('DEBUG_USER: существующие смены (snapshot):');
      snapshot.forEach(s => console.log(`  - ${toISODate(s.date.toDate())} | ${s.post.id} | ${s.startTime || s.post.defaultStartTime}-${s.endTime || s.post.defaultEndTime}`));

      const shabbatCheck = checkShabbatRule(debugUserObj, weekStart, []);
      console.log('DEBUG_USER: проверка Shabbat на существующих сменах:', shabbatCheck);
    }
  }

  console.log('=== НАЧАЛО ГЕНЕРАЦИИ РАСПИСАНИЯ ===');
  console.log(`Количество пользователей: ${users.length}`);
  console.log(`Целевая неделя: ${targetWeekDates[0].toLocaleDateString('he-IL')} - ${targetWeekDates[targetWeekDates.length - 1].toLocaleDateString('he-IL')}`);


  const usersForScheduling = users.map(user => ({
    ...user,
    shifts: [...user.shifts],
    availability: user.availability ? [...user.availability] : [],
    _meta: {
      assignedShifts: [],
      assignedDays: new Set(),
      weekShiftCount: 0,
    }
  }));

  // Логируем информацию о пользователях
  users.forEach(user => {
    const hasAvailability = user.availability && user.availability.length > 0;
    const roles = user.roles.join(', ');
    console.log(`  Пользователь: ${user.firstName} ${user.secondName}, роли: [${roles}], имеет запросы: ${hasAvailability ? 'да' : 'нет'}`);
  });

  const result: ScheduleGenerationResult = {
    success: true,
    shifts: new Map(),
    errors: [],
    warnings: []
  };

  // Инициализируем карту смен для каждого пользователя
  users.forEach(user => {
    result.shifts.set(user.id, []);
  });

  // Получаем все посты, которые нужно заполнить
  const postsToFill: Array<{ post: Post; date: Date }> = [];

  for (const date of targetWeekDates) {
    for (const post of Posts) {
      // Пропускаем посты для выходных, если это не выходной день
      const isWeekend = date.getDay() === 5 || date.getDay() === 6; // Friday or Saturday
      if (post.id.includes('-weekend') && !isWeekend) continue;
      if (!post.id.includes('-weekend') && isWeekend) {
        // Для выходных ищем версию с -weekend, если она есть
        const weekendPost = Posts.find(p => p.id === `${post.id}-weekend`);
        if (weekendPost) continue; // Используем версию для выходных
      }

      postsToFill.push({ post, date });
    }
  }

  // Сортируем посты по приоритету (сначала важные роли), затем по дате и ID поста (детерминизм)
  postsToFill.sort((a, b) => {
    const roleA = getRoleByPost(a.post.id);
    const roleB = getRoleByPost(b.post.id);

    const rolePriority: Record<string, number> = {
      'shift_manager': 1,
      'security_shift_leader': 2,
      'security_guard': 3
    };

    const priorityA = rolePriority[roleA || ''] || 999;
    const priorityB = rolePriority[roleB || ''] || 999;

    if (priorityA !== priorityB) return priorityA - priorityB;
    const dateDiff = a.date.getTime() - b.date.getTime();
    if (dateDiff !== 0) return dateDiff;
    return a.post.id.localeCompare(b.post.id);
  });

  // Рассчитываем ограничения по ночным сменам (чтобы не давать одному человеку все ночи)
  // Делим по ролям: для каждой роли считаем ночные слоты и количество доступных пользователей этой роли
  const nightSlotsPerRole = new Map<string, number>();
  for (const p of postsToFill) {
    if (getShiftPeriod(p.post) !== 'night') continue;
    const role = getRoleByPost(p.post.id) || 'any';
    nightSlotsPerRole.set(role, (nightSlotsPerRole.get(role) || 0) + 1);
  }

  const maxNightShiftsPerUserByRole: Record<string, number> = {};
  for (const [role, slots] of nightSlotsPerRole.entries()) {
    const eligibleCount = users.filter(u => {
      if (role === 'any') return true;
      return u.roles.includes(role as any);
    }).length || 1;

    maxNightShiftsPerUserByRole[role] = Math.max(1, Math.ceil(slots / eligibleCount));
  }

  // Фолбэк для ролей без ночных слотов
  const defaultTotalNightSlots = postsToFill.filter(p => getShiftPeriod(p.post) === 'night').length;
  const defaultMaxNightShiftsPerUser = Math.max(1, Math.ceil(defaultTotalNightSlots / users.length));

  // Настройки: максимальное количество ночных смен подряд (для предохранения от «всех ночей» у одного человека)
  const MAX_CONSECUTIVE_NIGHTS = 2;

  // FAIRNESS: идеальное число смен на пользователя в этой неделе (для равномерного распределения)
  const totalSlots = postsToFill.length;
  const idealSlotsPerUser = Math.max(1, Math.ceil(totalSlots / users.length));
  if (debug) console.log('FAIRNESS: totalSlots=', totalSlots, 'idealSlotsPerUser=', idealSlotsPerUser);

  // Список не заполненных постов (для возможного fallback-а в debug)
  const unfilledPosts: Array<{ post: Post; date: Date; period: ShiftPeriod }> = [];

  // Для каждого поста находим подходящего работника
  for (const { post, date } of postsToFill) {
    const period = getShiftPeriod(post);
    const periodIndex = periodToIndex(period);
    const dateKey = toISODate(date);
    const requiredRole = getRoleByPost(post.id);

    // Собираем кандидатов: доступны, могут работать на этом посту
    const candidates = users
      .filter(user => {
        // Проверка ролей
        if (!canUserWorkPost(user, post)) {
          // Пользователь не может работать на этом посту из-за ролей
          return false;
        }

        // Проверка availability
        if (!isUserAvailable(user, date, period)) {
          // Пользователь недоступен в этот период
          return false;
        }

        // Проверяем, не превышен ли лимит смен в неделе (6 смен)
        // Используем снимок существующих смен (originalShiftsByUser) для консистентности
        const existingSnapshotForCount = originalShiftsByUser.get(user.id) || [];
        const existingInWeek = existingSnapshotForCount.filter(s => {
          const shiftDate = s.date.toDate();
          const weekKey = getWeekKeyForShift(shiftDate);
          const targetWeekKey = getWeekKeyForShift(weekStart);
          return weekKey === targetWeekKey;
        }).length;

        const assignedInWeek = (result.shifts.get(user.id) || []).filter(s => {
          const shiftDate = s.date.toDate();
          return getWeekKeyForShift(shiftDate) === getWeekKeyForShift(weekStart);
        }).length;

        const shiftsInWeek = existingInWeek + assignedInWeek;

        // Debug: логируем расчёт лимита для debugUser или глобально при debug=true
        if (debug && (debugUser === undefined || debugUser === user.id || (user.firstName + ' ' + user.secondName) === debugUser)) {
          console.log(`DEBUG_LIMIT: ${user.firstName} ${user.secondName} existingInWeek=${existingInWeek} assignedInWeek=${assignedInWeek} total=${shiftsInWeek} (max=6)`);
        }

        if (shiftsInWeek >= 6) {
          // Превышен лимит смен в неделе (учитывая существующие и уже назначенные в ходе генерации)
          if (debug && (debugUser === undefined || debugUser === user.id || (user.firstName + ' ' + user.secondName) === debugUser)) {
            console.log(`DEBUG_LIMIT_REJECT: ${user.firstName} ${user.secondName} rejected due to weekly limit`);
          }
          return false;
        }

        return true;
      })
      .map(user => {
        // Вычисляем "желание" работать (по availability)
        const availability = user.availability?.find(av => toISODate(av.date.toDate()) === dateKey);

        let wantsToWork = 0;
        if (!availability) {
          // Нет availability - пользователь полностью открыт, средний приоритет (0.5)
          wantsToWork = 0.5;
        } else {
          const status = availability.statuses?.[periodIndex];
          if (status === true) {
            // Явно указал готовность работать - самый высокий приоритет
            wantsToWork = 1;
          } else if (status === false) {
            // Явно указал недоступность - не должен попасть в кандидаты (но это уже проверено в фильтре)
            wantsToWork = 0;
          } else {
            // status === null/undefined - пользователь подал запросы, но не указал для этого периода
            // Считаем доступным с средним приоритетом (0.5)
            wantsToWork = 0.5;
          }
        }

        // Опыт: количество существующих смен (взято из snapshot для детерминизма)
        const existingShiftsSnapshot = originalShiftsByUser.get(user.id) || [];
        const experience = existingShiftsSnapshot.length;

        // Текущие смены пользователя в неделе (считая только те, что мы уже добавили в result)
        const currentWeekShifts = (result.shifts.get(user.id) || []).filter(s => {
          return getWeekKeyForShift(s.date.toDate()) === getWeekKeyForShift(weekStart);
        }).length;

        // Ночные смены пользователя в текущей неделе (учитываем только назначенные в result)
        const currentWeekNightCount = (result.shifts.get(user.id) || []).filter(s => {
          return getWeekKeyForShift(s.date.toDate()) === getWeekKeyForShift(weekStart) && getShiftPeriod(s.post) === 'night';
        }).length;

        // Сколько уже было назначено на этот же пост в неделе
        const samePostCount = (result.shifts.get(user.id) || []).filter(s => {
          return getWeekKeyForShift(s.date.toDate()) === getWeekKeyForShift(weekStart) && s.post.id === post.id;
        }).length;

        // Сколько уже было назначено в том же периоде (morning/afternoon/night) в неделе
        const existingSnapshotForPeriod = originalShiftsByUser.get(user.id) || [];
        const existingPeriodCount = existingSnapshotForPeriod.filter(s => getWeekKeyForShift(s.date.toDate()) === getWeekKeyForShift(weekStart) && getShiftPeriod(s.post) === period).length;
        const assignedPeriodCount = (result.shifts.get(user.id) || []).filter(s => getWeekKeyForShift(s.date.toDate()) === getWeekKeyForShift(weekStart) && getShiftPeriod(s.post) === period).length;
        const samePeriodCount = existingPeriodCount + assignedPeriodCount;

        // Базовый скор с штрафами за уже большие нагрузки / ночи / однообразие по посту / однообразие по периоду
        // Базовый скор — усиленные штрафы, потом добавим fairness/rotation
        let score = wantsToWork * 1000 + experience - currentWeekShifts * 120 - currentWeekNightCount * 500 - samePostCount * 400 - samePeriodCount * 400;

        // Дополнительно для простых охранников усиливаем штраф за повторный пост (чтобы ротировать)
        const role = getRoleByPost(post.id);
        if (role === 'security_guard') {
          score -= samePostCount * 400; // сильный штраф за один и тот же пост
        }

        // Небольшая рандомизация (чтобы не давать пользователю одинаковые паттерны), но детерминизированная при seed
        let jitter = 0;
        if (randomize) {
          if (typeof seed === 'number') {
            const s = seed ^ hashStringToInt(user.id) ^ date.getTime();
            const rng = mulberry32(s);
            jitter = (rng() - 0.5) * 20; // от -10 до +10
          } else {
            jitter = (Math.random() - 0.5) * 20;
          }
          score += jitter;
        }

        // FAIRNESS: bonus + hard-penalty to avoid concentration
        const existingInWeekForFairness = (originalShiftsByUser.get(user.id) || []).filter(s => getWeekKeyForShift(s.date.toDate()) === getWeekKeyForShift(weekStart)).length;
        const assignedInWeekForFairness = (result.shifts.get(user.id) || []).filter(s => getWeekKeyForShift(s.date.toDate()) === getWeekKeyForShift(weekStart)).length;
        const totalForUser = existingInWeekForFairness + assignedInWeekForFairness;
        const fairnessBonus = (idealSlotsPerUser - totalForUser) * 200;
        score += fairnessBonus;

        if (totalForUser >= idealSlotsPerUser + 1) {
          // даём очень сильный штраф, чтобы практически исключить кандидата
          score -= 2000;
          if (debug && (debugUser === user.id || `${user.firstName} ${user.secondName}` === debugUser)) {
            console.log(`DEBUG_FAIR_REJECT: ${user.firstName} ${user.secondName} totalForUser=${totalForUser} (ideal=${idealSlotsPerUser})`);
          }
        }

        // Penalty for adjacent-day assignments (favor spacing)
        const userAssignedDays = new Set((result.shifts.get(user.id) || []).map(s => toISODate(s.date.toDate())));
        const dayBefore = new Date(date); dayBefore.setDate(dayBefore.getDate() - 1);
        const dayAfter = new Date(date); dayAfter.setDate(dayAfter.getDate() + 1);
        const dayBeforeKey = toISODate(dayBefore);
        const dayAfterKey = toISODate(dayAfter);
        if (userAssignedDays.has(dayBeforeKey) || userAssignedDays.has(dayAfterKey)) {
          score -= 300;
        }

        if (debug && debugUser && (debugUser === user.id || `${user.firstName} ${user.secondName}` === debugUser)) {
          console.log(`DEBUG_SCORE: ${user.firstName} ${user.secondName} | wants=${wantsToWork} exp=${experience} weekShifts=${currentWeekShifts} nights=${currentWeekNightCount} samePost=${samePostCount} samePeriod=${samePeriodCount} fairnessBonus=${fairnessBonus} jitter=${jitter.toFixed(2)} score=${score.toFixed(2)}`);
        }

        return {
          user,
          score,
          currentWeekShifts,
          currentWeekNightCount,
          samePostCount,
          samePeriodCount
        };
      })


      // Исключаем кандидатов, которые уже достигли лимита ночных смен для недели (по роли)
      .filter(c => {
        if (period === 'night') {
          const roleKey = requiredRole || 'any';
          const limit = maxNightShiftsPerUserByRole[roleKey] ?? defaultMaxNightShiftsPerUser;
          if (c.currentWeekNightCount >= limit) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        // Сортируем: сначала по score, затем по количеству текущих смен (равномерное распределение), затем по user.id (детерминизм)
        if (b.score !== a.score) return b.score - a.score;
        if (a.currentWeekShifts !== b.currentWeekShifts) return a.currentWeekShifts - b.currentWeekShifts;
        return a.user.id.localeCompare(b.user.id);
      });

    // Проверяем каждого кандидата на ограничения
    let assigned = false;
    const rejectedCandidates: Array<{ user: User; reason: string }> = [];

    for (const candidate of candidates) {
      const user = candidate.user;
      const userNewShifts = result.shifts.get(user.id) || [];

      // Предотвращаем более одной обычной смены в день (если пост не double)
      const dayKey = toISODate(date);
      const hasShiftSameDay = userNewShifts.some(s => toISODate(s.date.toDate()) === dayKey);
      if (hasShiftSameDay && !post.id.includes('-double')) {
        rejectedCandidates.push({ user, reason: 'уже есть назначенная обычная смена в этот день' });
        continue;
      }

      // Проверяем перерыв между сменами (8 часов минимум)
      let hasConflict = false;
      let conflictReason = '';

      // Снимок существующих смен - используем оригинальный snapshot для детерминизма
      const existingShiftsSnapshot = originalShiftsByUser.get(user.id) || [];

      // Проверяем с существующими сменами пользователя
      for (const existingShift of existingShiftsSnapshot) {
        const existingDate = existingShift.date.toDate();
        const existingEndTime = existingShift.endTime || existingShift.post.defaultEndTime;
        const newStartTime = post.defaultStartTime;

        // Определяем, какая смена идет раньше
        const existingTime = existingDate.getTime();
        const newTime = date.getTime();

        // Проверяем перерыв в обоих направлениях
        const existingShiftObj = {
          date: existingDate,
          startTime: existingShift.startTime || existingShift.post.defaultStartTime,
          endTime: existingEndTime
        };

        const newShiftObj = {
          date,
          startTime: newStartTime,
          endTime: post.defaultEndTime
        };

        // Проверяем: если новая смена идет после существующей
        if (newTime >= existingTime) {
          if (!hasMinBreakBetweenShifts(existingShiftObj, newShiftObj)) {
            hasConflict = true;
            conflictReason = `недостаточно перерыва с существующей сменой ${existingDate.toLocaleDateString('he-IL')} ${existingShiftObj.startTime}-${existingShiftObj.endTime}`;
            break;
          }
        } else {
          // Новая смена идет раньше существующей
          if (!hasMinBreakBetweenShifts(newShiftObj, existingShiftObj)) {
            hasConflict = true;
            conflictReason = `недостаточно перерыва с существующей сменой ${existingDate.toLocaleDateString('he-IL')} ${existingShiftObj.startTime}-${existingShiftObj.endTime}`;
            break;
          }
        }
      }

      if (hasConflict) {
        rejectedCandidates.push({ user, reason: conflictReason });
        continue;
      }

      // Проверяем с новыми сменами, которые уже назначены
      let newConflictFound = false;
      for (const newShift of userNewShifts) {
        const newShiftDate = newShift.date.toDate();
        const newShiftEndTime = newShift.endTime || newShift.post.defaultEndTime;
        const currentStartTime = post.defaultStartTime;

        const currentShiftObj = {
          date: newShiftDate,
          startTime: newShift.startTime || newShift.post.defaultStartTime,
          endTime: newShiftEndTime
        };

        const newShiftObj = {
          date,
          startTime: currentStartTime,
          endTime: post.defaultEndTime
        };

        // Определяем порядок смен
        const currentTime = newShiftDate.getTime();
        const newTime = date.getTime();

        if (newTime >= currentTime) {
          if (!hasMinBreakBetweenShifts(currentShiftObj, newShiftObj)) {
            newConflictFound = true;
            conflictReason = `недостаточно перерыва с уже назначенной сменой ${newShiftDate.toLocaleDateString('he-IL')} ${currentShiftObj.startTime}-${currentShiftObj.endTime}`;
            break;
          }
        } else {
          if (!hasMinBreakBetweenShifts(newShiftObj, currentShiftObj)) {
            newConflictFound = true;
            conflictReason = `недостаточно перерыва с уже назначенной сменой ${newShiftDate.toLocaleDateString('he-IL')} ${currentShiftObj.startTime}-${currentShiftObj.endTime}`;
            break;
          }
        }
      }

      if (newConflictFound) {
        rejectedCandidates.push({ user, reason: conflictReason });
        continue;
      }

      // Проверяем ограничение 6 смен подряд (с учетом предыдущих и следующих недель)
      const allUserShifts = [...existingShiftsSnapshot, ...userNewShifts];
      const tempShift: Shift = {
        id: 'temp',
        date: Timestamp.fromDate(date),
        post,
        startTime: post.defaultStartTime,
        endTime: post.defaultEndTime
      };

      // Сортируем все смены по дате
      const allShiftsSorted = [...allUserShifts, tempShift].sort((a, b) => {
        return a.date.toDate().getTime() - b.date.toDate().getTime();
      });

      // Проверяем последовательности дней со сменами
      let maxConsecutive = 1;

      // Группируем смены по дням
      const shiftsByDay = new Map<string, Shift[]>();
      for (const shift of allShiftsSorted) {
        const dayKey = toISODate(shift.date.toDate());
        if (!shiftsByDay.has(dayKey)) {
          shiftsByDay.set(dayKey, []);
        }
        shiftsByDay.get(dayKey)!.push(shift);
      }

      const sortedDays = Array.from(shiftsByDay.keys()).sort();

      // Проверяем последовательные дни
      if (sortedDays.length > 0) {
        let consecutiveCount = 1;

        for (let i = 1; i < sortedDays.length; i++) {
          const prevDate = new Date(sortedDays[i - 1] + 'T00:00:00');
          const currDate = new Date(sortedDays[i] + 'T00:00:00');

          const daysDiff = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff === 1) {
            consecutiveCount++;
            maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
          } else {
            consecutiveCount = 1;
          }
        }
      }

      if (maxConsecutive > 6) {
        rejectedCandidates.push({ user, reason: `превышен лимит 6 смен подряд (максимум: ${maxConsecutive})` });
        continue;
      }

      // Проверяем правило шаббата
      const shabbatCheck = checkShabbatRule(user, weekStart, [...userNewShifts, tempShift]);
      if (!shabbatCheck.valid) {
        // Это предупреждение, не всегда фатальное — но при сильной конкуренции мы можем отклонять
        rejectedCandidates.push({ user, reason: shabbatCheck.error || 'Нарушение правила шаббата' });
        continue;
      }

      // Доп. проверка: лимит ночных смен по роли + ограничение на подряд идущие ночи
      if (period === 'night') {
        const roleKey = requiredRole || 'any';
        const limit = maxNightShiftsPerUserByRole[roleKey] ?? defaultMaxNightShiftsPerUser;
        if (candidate.currentWeekNightCount >= limit) {
          rejectedCandidates.push({ user, reason: `достигнут лимит ночных смен для роли (${limit})` });
          continue;
        }

        // Проверяем, не создаст ли назначение этой ночной смены слишком длинную цепочку ночей подряд
        const existingSnapshot = originalShiftsByUser.get(user.id) || [];
        const assignedSoFar = result.shifts.get(user.id) || [];

        const nightDateKeys = new Set<string>();
        for (const s of [...existingSnapshot, ...assignedSoFar]) {
          if (getShiftPeriod(s.post) === 'night') {
            nightDateKeys.add(toISODate(s.date.toDate()));
          }
        }
        nightDateKeys.add(toISODate(date));

        const nightDates = Array.from(nightDateKeys).map(d => new Date(d + 'T00:00:00')).sort((a, b) => a.getTime() - b.getTime());

        let maxConsec = 1;
        let current = 1;
        for (let i = 1; i < nightDates.length; i++) {
          const diffDays = Math.round((nightDates[i].getTime() - nightDates[i - 1].getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            current += 1;
            maxConsec = Math.max(maxConsec, current);
          } else {
            current = 1;
          }
        }

        if (maxConsec > MAX_CONSECUTIVE_NIGHTS) {
          const reason = `превышен лимит ночных смен подряд (максимум: ${MAX_CONSECUTIVE_NIGHTS})`;
          rejectedCandidates.push({ user, reason });
          if (debug && (debugUser === undefined || debugUser === user.id || (user.firstName + ' ' + user.secondName) === debugUser)) {
            console.log(`DEBUG_NIGHT_REJECT: ${user.firstName} ${user.secondName} rejected for ${post.id} ${toISODate(date)}: ${reason} (maxConsec=${maxConsec})`);
          }
          continue;
        }
      }

      // Назначаем смену
      const newShift: Shift = {
        id: regenerateShiftId(`shift-${user.id}-${post.id}-${date.getTime()}`),
        date: Timestamp.fromDate(date),
        post,
        startTime: post.defaultStartTime,
        endTime: post.defaultEndTime
      };

      // Debug: лог перед назначением
      if (debug && (debugUser === undefined || debugUser === user.id || (user.firstName + ' ' + user.secondName) === debugUser)) {
        const existingInWeekDbg = (originalShiftsByUser.get(user.id) || []).filter(s => getWeekKeyForShift(s.date.toDate()) === getWeekKeyForShift(weekStart)).length;
        const assignedInWeekDbg = (result.shifts.get(user.id) || []).filter(s => getWeekKeyForShift(s.date.toDate()) === getWeekKeyForShift(weekStart)).length;
        console.log(`DEBUG_ASSIGN: assigning ${user.firstName} ${user.secondName} to ${post.id} ${toISODate(date)} (existingInWeek=${existingInWeekDbg}, assignedInWeekBefore=${assignedInWeekDbg})`);
      }

      userNewShifts.push(newShift);
      result.shifts.set(user.id, userNewShifts);
      assigned = true;
      break;

  }

    if (!assigned) {
      // Даем детальный отчет по отклонённым кандидатам
      for (const rej of rejectedCandidates) {
        console.error(`[${post.id} ${dateKey} ${period}] ${rej.user.firstName} ${rej.user.secondName}: ${rej.reason}`);

        // Дополнительная отладка по конкретному пользователю (debugUser)
        if (debug && debugUserObj && rej.user.id === debugUserObj.id) {
          const cand = candidates.find(c => c.user.id === rej.user.id);
          if (cand) {
            console.log(`[DEBUG_USER_CANDIDATE] ${cand.user.firstName} ${cand.user.secondName} | score=${cand.score} | weekShifts=${cand.currentWeekShifts} | weekNights=${cand.currentWeekNightCount} | samePost=${cand.samePostCount}`);
          }

          const existingSnapshot = forceFresh ? (originalShiftsByUser.get(rej.user.id) || []) : (rej.user.shifts || []);
          console.log(`[DEBUG_USER_DETAIL] существующие смены count=${existingSnapshot.length}`);
          existingSnapshot.forEach(s => console.log(`  - ${toISODate(s.date.toDate())} | ${s.post.id} | ${s.startTime || s.post.defaultStartTime}-${s.endTime || s.post.defaultEndTime}`));
        }
      }

      const dateStr = date.toLocaleDateString('he-IL');
      const errorMsg = `Не удалось назначить работника на пост "${post.title}" на ${dateStr} (${period})`;
      if (candidates.length === 0) {
        console.error(`[${post.id} ${dateKey} ${period}] ${errorMsg} - нет подходящих кандидатов`);
      } else {
        console.error(`[${post.id} ${dateKey} ${period}] ${errorMsg} - ${candidates.length} кандидат(ов), но все не прошли проверки ограничений`);
      }
      result.errors.push(errorMsg);
      // Сохраняем не заполненный пост для возможного debug fallback-а
      unfilledPosts.push({ post, date, period });
      // Не устанавливаем success = false здесь, продолжаем заполнять другие посты
    }
}

  // Debug-only fallback: попытаться заполнить критичные незаполненные посты (например, shift_manager)
  if (debug && unfilledPosts.length > 0) {
    const managerUnfilled = unfilledPosts.filter(p => getRoleByPost(p.post.id) === 'shift_manager');
    for (const { post, date, period } of managerUnfilled) {
      const dateKey = toISODate(date);
      // Расслабленные кандидаты: только проверяем роли и availability и минимальный перерыв
      const relaxedCandidates = users.filter(u => canUserWorkPost(u, post) && isUserAvailable(u, date, period))
        .map(u => {
          const userShifts = result.shifts.get(u.id) || [];
          const currentWeekShifts = userShifts.filter(s => getWeekKeyForShift(s.date.toDate()) === getWeekKeyForShift(weekStart)).length;
          return { user: u, currentWeekShifts };
        })
        .filter(c => c.currentWeekShifts < 6) // оставляем ограничение 6 смен в неделе
        .sort((a, b) => a.currentWeekShifts - b.currentWeekShifts);

      let assigned = false;

      for (const cand of relaxedCandidates) {
        const user = cand.user;

        // Проверяем минимальный перерыв с существующими и уже назначенными сменами
        const existingSnapshot = forceFresh ? (originalShiftsByUser.get(user.id) || []) : (user.shifts || []);
        let conflict = false;
        for (const es of existingSnapshot) {
          const existingShiftObj = { date: es.date.toDate(), startTime: es.startTime || es.post.defaultStartTime, endTime: es.endTime || es.post.defaultEndTime };
          const newShiftObj = { date, startTime: post.defaultStartTime, endTime: post.defaultEndTime };
          if (!hasMinBreakBetweenShifts(existingShiftObj, newShiftObj) && !hasMinBreakBetweenShifts(newShiftObj, existingShiftObj)) {
            conflict = true; break;
          }
        }
        if (conflict) continue;

        // Проверяем перерывы с уже назначенными сменами
        const userNewShifts = result.shifts.get(user.id) || [];
        let conflict2 = false;
        for (const ns of userNewShifts) {
          const nsObj = { date: ns.date.toDate(), startTime: ns.startTime || ns.post.defaultStartTime, endTime: ns.endTime || ns.post.defaultEndTime };
          const newShiftObj = { date, startTime: post.defaultStartTime, endTime: post.defaultEndTime };
          if (!hasMinBreakBetweenShifts(nsObj, newShiftObj) && !hasMinBreakBetweenShifts(newShiftObj, nsObj)) {
            conflict2 = true; break;
          }
        }
        if (conflict2) continue;

        // Назначаем смену (релаксированный режим), фиксируем предупреждение
        const newShift: Shift = {
          id: regenerateShiftId(`fallback-${user.id}-${post.id}-${date.getTime()}`),
          date: Timestamp.fromDate(date),
          post,
          startTime: post.defaultStartTime,
          endTime: post.defaultEndTime
        };

        const arr = result.shifts.get(user.id) || [];
        arr.push(newShift);
        result.shifts.set(user.id, arr);
        assigned = true;
        const dateStr = date.toLocaleDateString('he-IL');
        const msg = `DEBUG_FALLBACK: назначен ${user.firstName} ${user.secondName} на пост "${post.title}" ${dateStr} (${period}) в релакс режиме`;
        console.warn(msg);
        result.warnings.push(msg);
        break;
      }

      if (!assigned) {
        const dateStr = date.toLocaleDateString('he-IL');
        console.warn(`DEBUG_FALLBACK: не удалось заполнить пост "${post.title}" на ${dateStr} (${period}) даже в релакс режиме`);
      }
    }
  }

  // Финальная проверка правила шаббата для всех пользователей
  // Добавляем только предупреждения, не останавливаем генерацию
  for (const user of users) {
    const userShifts = result.shifts.get(user.id) || [];
    if (userShifts.length > 0) {
      const shabbatCheck = checkShabbatRule(user, weekStart, userShifts);
      if (!shabbatCheck.valid) {
        result.warnings.push(shabbatCheck.error || `Нарушение правила шаббата для ${user.firstName} ${user.secondName}`);
      }
    }
  }

  // Добавляем сигнатуру назначенных смен (детерминированный вывод) в debug-лог для сравнения между прогонками
  if (debug) {
    const assignedEntries: string[] = [];
    for (const [userId, shifts] of result.shifts.entries()) {
      for (const s of shifts) {
        assignedEntries.push(`${s.post.id}|${toISODate(s.date.toDate())}|${userId}`);
      }
    }
    assignedEntries.sort();
    console.log('ASSIGNED_SIGNATURE:', assignedEntries.join(';'));

    // Debug consistency check: прогоняем генератор ещё раз на тех же данных и сравниваем сигнатуры
    if (!_consistencyRun) {
      try {
        const secondOpts = { ...(opts as GenerateOptions), _consistencyRun: true } as GenerateOptions;
        const second = generateSchedule(users, weekStart, targetWeekDates, secondOpts);

        const assignedEntries2: string[] = [];
        for (const [userId, shifts] of second.shifts.entries()) {
          for (const s of shifts) {
            assignedEntries2.push(`${s.post.id}|${toISODate(s.date.toDate())}|${userId}`);
          }
        }
        assignedEntries2.sort();

        const sig1 = assignedEntries.join(';');
        const sig2 = assignedEntries2.join(';');
        if (sig1 !== sig2) {
          console.warn('CONSISTENCY CHECK FAILED: ASSIGNED_SIGNATURE differs between runs');

          const onlyInFirst = assignedEntries.filter(x => !assignedEntries2.includes(x));
          const onlyInSecond = assignedEntries2.filter(x => !assignedEntries.includes(x));

          console.warn('ONLY_IN_FIRST:', onlyInFirst);
          console.warn('ONLY_IN_SECOND:', onlyInSecond);

          result.warnings.push(`CONSISTENCY CHECK FAILED: signatures differ (onlyInFirst=${onlyInFirst.length}, onlyInSecond=${onlyInSecond.length})`);
        } else {
          console.log('CONSISTENCY CHECK PASSED');
        }
      } catch (e) {
        console.warn('CONSISTENCY CHECK ERROR:', e);
        result.warnings.push('CONSISTENCY CHECK ERROR: ' + (e as Error).message);
      }
    }
  }

  // Устанавливаем success = true если назначена хотя бы одна смена
  const totalShifts = Array.from(result.shifts.values()).reduce((sum, shifts) => sum + shifts.length, 0);
  if (totalShifts > 0) {
    result.success = true;
  }

  return result;
}

