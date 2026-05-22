import { StyleSheet, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import ScheduleGrid from '../ScheduleGrid/ScheduleGrid';
import { useSelector } from 'react-redux';
import { State } from '../../types/State';
import { GuardTasks } from '../../constants/GuardTasks';
import { GuardTask } from '../../types/GuardTask';
import { isSameDay, formatHeaderDate, normalizeDate } from '../../utils/getCurrentWeekDates';
import useUser from '../../hooks/useUser';
import { useShiftRequestModal } from '../../hooks/useShiftRequestModal';
import { getIsoLocalDateKey } from '../../utils/getIsoLocalDateKey';
import ShiftActionsModal from '../ShiftActionsModal/ShiftActionsModal';
import { DERT_POSTS, DertPostsOrder, OCC_POSTS, OccPostsOrder, ROLE_TO_DEFAULT_SCHEDULE, ROLE_VISIBILITY, SECURITY_POSTS, SecurityPostsOrder } from '../../constants/Posts';
import { Pressable, Text } from 'react-native';

export default function ScheduleListGeneral({ weekDates }: { weekDates: Date[] }) {

  const users = useSelector((state: State) => state.data.users);
  const user = useUser();

  const userDefaultSchedule = user?.roles
    ?.map(r => ROLE_TO_DEFAULT_SCHEDULE[r])
    .find(Boolean) ?? "security";

  const [scheduleType, setScheduleType] = useState<
    "security" | "occ" | "dert"
  >(userDefaultSchedule);


  const [isModalOpen, setModalOpen] = useState(false);
  const [remarkText, setRemarkText] = useState('');
  const [modalDate, setModalDate] = useState('');
  const [modalTimes, setModalTimes] = useState('');
  const [remarkTitle, setRemarkTitle] = useState('');
  const [guardTasks, setGuardTasks] = useState<GuardTask[]>([]);

  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);

  const dateKeys = useMemo(() => weekDates.map(getIsoLocalDateKey), [weekDates]);

  const posts = useMemo(() => {
    if (!user) return [];

    const base =
      scheduleType === "security"
        ? SECURITY_POSTS
        : scheduleType === "occ"
        ? OCC_POSTS
        : DERT_POSTS;

    return base
      .filter(post => {
        // ✅ ALWAYS show shift manager posts
        if (post.role === "shift_manager") return true;

        // normal visibility rules for everything else
        const allowedRoles = new Set(
          user.roles.flatMap(role => ROLE_VISIBILITY[role] ?? [])
        );



        return allowedRoles.has(post.role);
      })
      .sort((a, b) => {
        const orderMap =
          scheduleType === "security"
            ? new Map(SecurityPostsOrder.map((p, i) => [p.id, i]))
            : scheduleType === "occ"
            ? new Map(OccPostsOrder.map((p, i) => [p.id, i]))
            : new Map(DertPostsOrder.map((p, i) => [p.id, i]));

        return (orderMap.get(a.id) ?? 9999) - (orderMap.get(b.id) ?? 9999);
      });
  }, [user, scheduleType]);

  const rows = useMemo(() => {
    return [...posts]
      .map((post) => {
        const shiftsMap: Record<string, string | null> = {};

        dateKeys.forEach((key, idx) => {
          const day = weekDates[idx];

          const names = users
            .filter((u) =>
              u.shifts?.some(
                (s) =>
                  isSameDay(normalizeDate(s.date), day) &&
                  s.post?.id === post.id
              )
            )
            .map((u) => `${u.firstName} ${u.secondName}`);

          shiftsMap[key] = names.length ? names.join(', ') : null;
        });

        return {
          id: post.id,
          name: post.title,
          shifts: shiftsMap,
        };
      });
  }, [users, dateKeys, posts]);

  const {
    currentShift,
    setCurrentShift,
    isMyShift,
    setIsMyShift,
    close,
    modalView
  } = useShiftRequestModal(() => setModalOpen(false));

  const handleCloseModal = () => {
    close();
    setModalOpen(false);
    setSelectedShiftId(null);
  }

  return (
    <View style={styles.container}>
      {
        user?.roles.includes("shift_manager")
        &&
        <View style={styles.toggleContainer}>

          <Pressable
            style={[
              styles.toggleButton,
              scheduleType === "security" && styles.toggleButtonActive
            ]}
            onPress={() => setScheduleType("security")}
          >
            <Text>אבטחה</Text>
          </Pressable>

          <Pressable
            style={[
              styles.toggleButton,
              scheduleType === "occ" && styles.toggleButtonActive
            ]}
            onPress={() => setScheduleType("occ")}
          >
            <Text>חדר בקרה</Text>
          </Pressable>

          <Pressable
            style={[
              styles.toggleButton,
              scheduleType === "dert" && styles.toggleButtonActive
            ]}
            onPress={() => setScheduleType("dert")}
          >
            <Text>חירום</Text>
          </Pressable>

        </View>
      }
      <ScheduleGrid
        dates={dateKeys}
        rows={rows}
        cellWidth={96}
        onCellPress={(postId, dateKey, value) => {
          const dayIndex = dateKeys.indexOf(dateKey);
          const day = weekDates[dayIndex];
          setSelectedShiftId(value)

          const parts: string[] = [];
          const times = new Set<string>();

          const selectedShift = users
            .flatMap(u => u.shifts?.filter(s => s.post?.id === postId && isSameDay(normalizeDate(s.date), day)) || [])
            .find(s => s);

          if (!selectedShift) return;

          setCurrentShift(selectedShift);
          setModalOpen(true);

          const fullName = `${user?.firstName || ''} ${user?.secondName || ''}`;

          value && setIsMyShift(value.includes(fullName));

          users.forEach((u) => {
            u.shifts?.forEach((s) => {
              if (s.post?.id === postId && isSameDay(normalizeDate(s.date), day)) {
                const start = s.startTime ?? s.post.defaultStartTime;
                const end = s.endTime ?? s.post.defaultEndTime;
                const time = (start || end) ? `${start} - ${end}` : '';
                if (time) times.add(time);

                const rem = s.remark ? s.remark : '';
                parts.push(`${rem ? `\n${rem}` : `\nאין הערות`}`);
              }
            });
          });

          // choose appropriate tasks for the day
          const isWeekend = day.getDay() === 5 || day.getDay() === 6;
          // determine shift suffix (morning/afternoon/night)
          const suffixMatch = postId.match(/-(morning|afternoon|night)$/);
          const suffix = suffixMatch ? suffixMatch[1] : null;
          const basePostId = postId.replace(/-(morning|afternoon|night)$/, '');
          // if postId has suffix (morning/afternoon/night), build weekend id accordingly
          const weekendPostId = suffix ? `${basePostId}-${suffix}-weekend` : `${basePostId}-weekend`;

          let tasksForPost: GuardTask[] = [];
          // For weekend: prefer weekend-specific tasks for morning/afternoon shifts only.
          if (isWeekend && suffix !== 'night') {
            // prefer specific weekend-suffix (e.g. base-morning-weekend). If not found, fall back to base-weekend
            if (GuardTasks.some(t => t.postId === weekendPostId)) {
              tasksForPost = GuardTasks.filter(t => t.postId === weekendPostId);
            } else if (GuardTasks.some(t => t.postId === `${basePostId}-weekend`)) {
              tasksForPost = GuardTasks.filter(t => t.postId === `${basePostId}-weekend`);
            } else {
              tasksForPost = GuardTasks.filter(t => t.postId === postId);
            }
          } else {
            // for night shifts (even on weekend) and default case use exact postId tasks
            tasksForPost = GuardTasks.filter(t => t.postId === postId);
          }

          // build shift intervals from collected times (format like '06:30 - 15:00' or '06:30-15:00')
          const shiftIntervals = Array.from(times).map((tm) => {
            const parts = tm.split('-').map(p => p.trim());
            return { start: parts[0], end: parts[1] };
          }).filter(i => i.start && i.end);

          const toMinutes = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + (m || 0);
          };

          const intervalsOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
            let aS = toMinutes(aStart);
            let aE = toMinutes(aEnd);
            let bS = toMinutes(bStart);
            let bE = toMinutes(bEnd);
            if (aE <= aS) aE += 24 * 60;
            if (bE <= bS) bE += 24 * 60;
            return Math.max(aS, bS) < Math.min(aE, bE);
          };

          const filteredByTime = tasksForPost.filter((t) => {
            if (!t.time) return true;
            const [ts, te] = t.time.split('-').map(x => x.trim());
            if (shiftIntervals.length === 0) return true; // no shift time info -> keep
            return shiftIntervals.some(si => intervalsOverlap(ts, te, si.start, si.end));
          });

          setGuardTasks(filteredByTime);

          const text = parts.length ? parts.join('\n\n') : '';

          const postFromConst = posts.find((p) => p.id === postId);
          const title = postFromConst ? postFromConst.title : postId;

          setRemarkTitle(title);
          const formattedDate = formatHeaderDate(day);
          setModalDate(formattedDate);
          setModalTimes(Array.from(times).join(', '));
          setRemarkText(text);
          setModalOpen(true);
        }}
      />

      {
        currentShift && selectedShiftId
        &&
        <ShiftActionsModal
          visible={isModalOpen}
          remarkText={remarkText}
          modalDate={modalDate}
          modalView={modalView}
          modalTimes={modalTimes}
          remarkTitle={remarkTitle}
          guardTasks={guardTasks}
          onClose={handleCloseModal}
          isMyShift={isMyShift}
          currentShift={currentShift}
        />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: '100%', backgroundColor: 'rgb(242,242,242)' },
  modalShiftsList: {
    maxHeight: 200,
    borderWidth: 1,
    padding: 8,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: 'inset 0px -4px 10px 0px rgba(0,0,0,0.4)'
  },

    toggleContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    justifyContent: 'center',
  },

  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ddd',
  },

  toggleButtonActive: {
    backgroundColor: '#bbb',
  },
});
