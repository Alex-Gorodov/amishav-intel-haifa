import { Shift } from "../types/Shift";
import { normalizeDate } from "./getCurrentWeekDates";

export function getMonthlyHours(
  shifts: Shift[],
  month: number = new Date().getMonth(),
  year: number = new Date().getFullYear()
): number {
  return shifts.reduce((sum, shift) => {
    const shiftDate = normalizeDate(shift.date);
    if (shiftDate.getMonth() !== month || shiftDate.getFullYear() !== year) return sum;

    if (!shift.startTime || !shift.endTime) return sum;

    const [startH, startM] = shift.startTime.split(":").map(Number);
    const [endH, endM] = shift.endTime.split(":").map(Number);

    let hours = (endH + endM / 60) - (startH + startM / 60);

    // если смена переходит через полночь
    if (hours < 0) hours += 24;

    return sum + hours;
  }, 0);
}
