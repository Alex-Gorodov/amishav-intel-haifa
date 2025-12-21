import { Shift } from "../types/Shift";

export function getShiftDuration(shift: Shift) {
  const start = shift.startTime || shift.post.defaultStartTime;
  const end = shift.endTime || shift.post.defaultEndTime;
  if (!start || !end) return "00:00";

  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const startTotal = startH * 60 + startM;
  let endTotal = endH * 60 + endM;

  if (endTotal < startTotal) {
    endTotal += 24 * 60;
  }

  const diff = endTotal - startTotal;

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  return hours + minutes / 60;
}
