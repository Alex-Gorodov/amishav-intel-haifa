import {  Holiday, ShabbatTimes } from "../../types/ShabbatTimes";

export async function fetchShabbatTimes(friday: Date): Promise<ShabbatTimes> {

  const year = friday.getFullYear();
  const month = friday.getMonth() + 1; // 1–12
  const day = friday.getDate();

  const url = `https://www.hebcal.com/shabbat?cfg=json&geonameid=294801&M=on&gy=${year}&gm=${month}&gd=${day}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    let candles: Date | null = null;
    let havdalah: Date | null = null;

    data.items?.forEach((item: any) => {
      if (item.category === "candles") {
        const dateStr = item.date.split('T')[0] + 'T' + item.date.split('T')[1].split('Z')[0];
        candles = new Date(dateStr);
      }
      if (item.category === "havdalah") {
        const dateStr = item.date.split('T')[0] + 'T' + item.date.split('T')[1].split('Z')[0];
        havdalah = new Date(dateStr);
      }
    });

    return { candles, havdalah };

  } catch (e) {
    console.error("Error fetching Shabbat times", e);
    return { candles: null, havdalah: null };
  }
}

export async function fetchHolidaysByMonth(date: Date): Promise<Holiday[]> {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const url = `https://www.hebcal.com/hebcal?cfg=json&geonameid=294801&year=${year}&month=${month}&maj=on&min=on&lg=he`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const holidays: Holiday[] = [];

    data.items?.forEach((item: any) => {
      if (item.category === "holiday") {
        holidays.push({
          title: item.hebrew || item.title,
          date: new Date(item.date),
        });
      }
    });

    return holidays;
  } catch (e) {
    console.error("Error fetching holidays", e);
    return [];
  }
}
