export type WeekDay = {
  iso: string;
  date: Date;
  label: string;
};

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getWeekDates(referenceDate: Date = new Date(), weekStartsOn: 0 | 1 = 0, locale: string = 'ru-RU'): WeekDay[] {
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const day = ref.getDay();

  const diff = (day - weekStartsOn + 7) % 7;
  const start = new Date(ref);
  start.setDate(ref.getDate() - diff);

  const res: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = toISODate(d);

    const weekday = d.toLocaleDateString(locale, { weekday: 'short' });
    const dayNum = d.getDate();
    const label = `${weekday} ${dayNum}`;
    res.push({ iso, date: d, label });
  }
  return res;
}

export default { getWeekDates, toISODate };
