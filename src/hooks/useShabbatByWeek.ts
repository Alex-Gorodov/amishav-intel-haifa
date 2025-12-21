import { useEffect, useState } from 'react';
import { Shift } from '../types/Shift';
import { ShabbatTimes } from '../types/ShabbatTimes';
import { fetchShabbatTimes } from '../store/api/fetchShabbatTimes';

export function useShabbatByWeek(shifts?: Shift[]) {
  const [shabbatByWeek, setShabbatByWeek] = useState<{ [weekKey: string]: ShabbatTimes }>({});

  useEffect(() => {
    if (!shifts) return;

    const loadShabbat = async () => {
      const newShabbatByWeek: { [weekKey: string]: ShabbatTimes } = {};

      for (const shift of shifts) {
        const shiftDate = shift.date.toDate();
        if (!(shiftDate instanceof Date)) continue;

        const day = shiftDate.getDay();
        const daysUntilFriday = (5 - day + 7) % 7;
        const friday = new Date(shiftDate);
        friday.setDate(friday.getDate() + daysUntilFriday);

        const weekKey = friday.toISOString().slice(0, 10);

        if (!newShabbatByWeek[weekKey]) {
          const shabbat = await fetchShabbatTimes(friday);
          newShabbatByWeek[weekKey] = shabbat;
        }
      }

      setShabbatByWeek(newShabbatByWeek);
    };

    loadShabbat();
  }, [shifts]);

  return shabbatByWeek;
}
