import { Shift } from "../types/Shift";

export function getShiftDuration(shift: Shift) {
  const start = shift.startTime || shift.post.defaultStartTime;
  const end = shift.endTime || shift.post.defaultEndTime;
  if (!start || !end) return 0;

  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  let duration = (endH + endM / 60) - (startH + startM / 60);

  // если смена через полночь
  if (duration < 0) duration += 24;

  return duration;
}
