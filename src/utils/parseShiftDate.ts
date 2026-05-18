export const parseShiftDate = (date: any): Date => {
  if (!date) return new Date();

  if (
    typeof date === 'object' &&
    'toDate' in date &&
    typeof date.toDate === 'function'
  ) {
    return date.toDate();
  }

  return new Date(date);
};
