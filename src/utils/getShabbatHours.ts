import { Shift } from "../types/Shift";
import { ShabbatTimes } from "../types/ShabbatTimes";
import { getWeekKeyForShift } from "./getWeekKeyForShift";
import { getHoursString } from './getHoursString';

export const getShabbatHours = (shift: Shift, shabbatByWeek: Record<string, ShabbatTimes>): number => {
  const shiftDate = shift.date.toDate();
  const [sh, sm] = shift.startTime.split(':').map(Number);
  const [eh, em] = shift.endTime.split(':').map(Number);

  const shiftStart = new Date(shiftDate);
  shiftStart.setHours(sh, sm, 0, 0);

  const shiftEnd = new Date(shiftDate);
  shiftEnd.setHours(eh, em, 0, 0);
  if (shiftEnd <= shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

  const weekKey = getWeekKeyForShift(shiftStart);
  const shabbat = shabbatByWeek[weekKey];

  if (!shabbat?.candles || !shabbat.havdalah) {
    return 0;
  }

  const candles = new Date(shabbat.candles);
  const havdalah = new Date(shabbat.havdalah);

  const overlapStart = shiftStart > candles ? shiftStart : candles;
  const overlapEnd = shiftEnd < havdalah ? shiftEnd : havdalah;

  const diff = overlapEnd.getTime() - overlapStart.getTime();
  const hours = diff > 0 ? +(diff / 1000 / 3600).toFixed(2) : 0;
  return hours;
};


export function getShabbatHoursString(shifts: Shift[], shabbatByWeek: Record<string, ShabbatTimes>): string {

  const timeStringToHours = (t: string | number): number => {
    if (typeof t === "number") return t;
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
  };

  const totalShabbatHoursNumber = shifts.reduce(
    (acc, s) => acc + timeStringToHours(getShabbatHours(s, shabbatByWeek)),
    0
  );

  return getHoursString(totalShabbatHoursNumber);
}
