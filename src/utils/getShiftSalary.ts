import { Shift } from "../types/Shift";
import { ShabbatTimes } from "../types/ShabbatTimes";

function getWeekKeyForShift(shiftStart: Date): string {
  const day = shiftStart.getDay();
  const daysSinceFriday = (day + 2) % 7;
  const friday = new Date(shiftStart);
  friday.setDate(friday.getDate() - daysSinceFriday);
  return friday.toISOString().slice(0, 10);
}

export function getShiftSalary(
  shift: Shift,
  shabbatTimes?: ShabbatTimes
) {
  const { startTime, endTime, post, date } = shift;
  const hourlyRate = post.hourlyRate;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const shiftDate = new Date(date.seconds * 1000);
  let shiftStart = new Date(shiftDate);
  shiftStart.setHours(startHour, startMinute, 0, 0);

  let shiftEnd = new Date(shiftDate);
  shiftEnd.setHours(endHour, endMinute, 0, 0);

  if (shiftEnd <= shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

  let regularHours = 0;
  let shabbatHours = 0;

  if (shabbatTimes?.candles && shabbatTimes?.havdalah) {
    const shabbatStart = new Date(shabbatTimes.candles);
    const shabbatEnd = new Date(shabbatTimes.havdalah);

    if (shiftEnd <= shabbatStart || shiftStart >= shabbatEnd) {
      regularHours = (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);
    } else {
      if (shiftStart < shabbatStart) regularHours = (shabbatStart.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);
      if (shiftEnd > shabbatEnd) regularHours += (shiftEnd.getTime() - shabbatEnd.getTime()) / (1000 * 60 * 60);

      const shabbatStartOverlap = Math.max(shiftStart.getTime(), shabbatStart.getTime());
      const shabbatEndOverlap = Math.min(shiftEnd.getTime(), shabbatEnd.getTime());
      shabbatHours = (shabbatEndOverlap - shabbatStartOverlap) / (1000 * 60 * 60);
    }
  } else {
    regularHours = (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);
  }

  const shabbatMultiplier = 1.5;
  const totalPay = Number((regularHours * hourlyRate + shabbatHours * hourlyRate * shabbatMultiplier).toFixed(2));

  return { regularHours, shabbatHours, totalPay };
}

export function getMonthlySalary(
  shifts: Shift[],
  shabbatByWeek: { [weekKey: string]: ShabbatTimes }
) {
  const total = shifts.reduce((total, shift) => {
    const weekKey = getWeekKeyForShift(shift.date.toDate());
    const shabbat = shabbatByWeek[weekKey];
    const salary = getShiftSalary(shift, shabbat);
    return total + salary.totalPay;
  }, 0);

  return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
