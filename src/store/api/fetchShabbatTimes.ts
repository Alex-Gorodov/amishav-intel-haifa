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

// export async function fetchHolidayPeriods(friday: Date): Promise<Holiday[]> {
//   const year = friday.getFullYear();
//   const month = friday.getMonth() + 1;

//   const url = `https://www.hebcal.com/hebcal?cfg=json&geonameid=294801&year=${year}&month=${month}&maj=on`;

//   try {
//     const res = await fetch(url);
//     const data = await res.json();

//     const periods: Holiday[] = [];

//     let currentStart: Date | null = null;
//     let currentTitle = '';

//     data.items?.forEach((item: any) => {
//       if (item.category === 'holiday') {
//         const date = new Date(item.date);

//         if (item.title.includes('Erev')) {
//           currentStart = date;
//           currentTitle = item.title;
//         } else if (currentStart) {
//           const end = new Date(date);
//           end.setHours(20, 0, 0);

//           periods.push({
//             start: currentStart,
//             end,
//             title: currentTitle,
//           });

//           currentStart = null;
//         }
//       }
//     });

//     return periods;

//   } catch (e) {
//     console.error('Error fetching holiday periods', e);
//     return [];
//   }
// }


export async function fetchHolidaysByMonth(date: Date): Promise<Holiday[]> {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const url = `https://www.hebcal.com/hebcal?cfg=json&geonameid=294801&year=${year}&month=${month}&maj=on&min=on`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const holidays: Holiday[] = [];

    data.items?.forEach((item: any) => {
      if (item.category === "holiday") {
        holidays.push({
          title: item.title,
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
