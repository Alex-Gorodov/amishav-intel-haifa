export const regenerateShiftId = (shiftId: string) =>
  `${shiftId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
