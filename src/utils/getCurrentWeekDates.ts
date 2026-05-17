export function normalizeDate(date: any): Date {
  if (!date) return new Date();

  if (date instanceof Date) {
    return date;
  }

  if (typeof date.toDate === 'function') {
    return normalizeDate(date);
  }

  return new Date(date);
}

export function getCurrentWeekDates(reference = new Date(), startOfWeek: 'mon' | 'sun' = 'mon') {
  const d = new Date(reference);

  const dayOfWeek = (d.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() - dayOfWeek);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    dates.push(dt);
  }

  if (startOfWeek === 'sun') {
    // Return Sunday before the Monday (so week is Sun..Sat with Sunday preceding the Monday)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() - 1);
    return [sunday, ...dates.slice(0, 6)];
  }

  return dates;
}

export function isoDateKey(dt: Date) {
  return dt.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function formatHeaderDate(dt: Date) {
  return dt.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric' });
}

export function isSameDay(a: any, b: any): boolean {
  const dateA = normalizeDate(a);
  const dateB = normalizeDate(b);

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}
