import { useEffect, useState } from "react";
import { Shift } from "../types/Shift";
import { Holiday } from "../types/ShabbatTimes";
import { fetchHolidaysByMonth } from "../store/api/fetchShabbatTimes";

export function useHolidaysByWeek(shifts?: Shift[]) {
  const [holidaysByWeek, setHolidaysByWeek] = useState<{ [weekKey: string]: Holiday[] }>({});

  useEffect(() => {
    if (!shifts) return;

    const load = async () => {
      const result: { [weekKey: string]: Holiday[] } = {};

      for (const shift of shifts) {
        const shiftDate = shift.date.toDate();

        const day = shiftDate.getDay();
        const daysUntilFriday = (5 - day + 7) % 7;

        const friday = new Date(shiftDate);
        friday.setDate(friday.getDate() + daysUntilFriday);

        const weekKey = friday.toISOString().slice(0, 10);

        if (!result[weekKey]) {
          const holidays = await fetchHolidaysByMonth(friday);
          result[weekKey] = holidays;
        }
      }

      setHolidaysByWeek(result);
    };

    load();
  }, [shifts]);

  return holidaysByWeek;
}
