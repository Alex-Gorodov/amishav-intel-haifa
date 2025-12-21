export function getWeekKeyForShift(shiftStart: Date): string {
  const day = shiftStart.getDay();

  const daysSinceFriday = (day + 2) % 7;
  const friday = new Date(shiftStart);
  friday.setDate(friday.getDate() - daysSinceFriday);

  return friday.toISOString().slice(0, 10);
}
