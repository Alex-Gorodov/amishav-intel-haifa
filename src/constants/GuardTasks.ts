import { GuardTask } from "../types/GuardTask";

export const GuardTasks: GuardTask[] = [
  // מקדימה
  { postId: "patrol-preliminary-2", location: "מקדימה", time: "07:00-08:00" },
  { postId: "patrol-main-morning", location: "מקדימה", time: "08:00-09:00" },
  { postId: "patrol-preliminary-1", location: "מקדימה", time: "09:00-10:00" },
  { postId: "patrol-preliminary-2", location: "מקדימה", time: "10:00-10:40" },
  { postId: "patrol-main-morning", location: "מקדימה", time: "10:40-11:30" },
  { postId: "patrol-preliminary-1", location: "מקדימה", time: "11:30-12:30" },
  { postId: "patrol-preliminary-2", location: "מקדימה", time: "12:30-13:00" },
  { postId: "gatehouse-morning", location: "מקדימה", time: "13:00-13:30" },
  { postId: "gatehouse-reinforcement", location: "מקדימה", time: "13:30-14:00" },
  { postId: "patrol-main-morning", location: "מקדימה", time: "14:00-15:00" },
  { postId: "patrol-main-afternoon", location: "מקדימה", time: "15:00-16:00" },
  { postId: "patrol-satellite-afternoon", location: "מקדימה", time: "16:00-16:30" },
  { postId: "patrol-preliminary-2", location: "מקדימה", time: "16:30-17:00" },

  // IDC1-4
  { postId: "patrol-preliminary-1", location: "IDC1-4", time: "07:00-09:00", remark: "סריקה חיצונית + קומות מינוסים עד קומה 1" },
  { postId: "patrol-main-morning", location: "IDC1-4", time: "09:00-10:40", remark: "קומות עליונות קומה 1 ומעלה" },
  { postId: "patrol-main-afternoon", location: "IDC1-4", time: "16:00-17:00", remark: "סריקה חיצונית" },
  { postId: "patrol-main-afternoon", location: "IDC1-4", time: "18:00-20:00", remark: "סריקה מלאה" },
  { postId: "gatehouse-night", location: "IDC1-4", time: "03:00-06:00", remark: "סריקת מעבדות: טסטים/אנלטיות, קומה 2 - data center, קומה 4 מעבדות" },
  { postId: "patrol-satellite-morning-weekend", location: "IDC1-4", time: "12:00-13:00", remark: "קומת מס\"ד + טסטים" },
  { postId: "patrol-satellite-afternoon-weekend", location: "IDC1-4", time: "19:00-20:00", remark: "חדר אנרגיה + קומה 4 מעבדות" },

  // IDC 6 - קומה 6
  { postId: "patrol-preliminary-2", location: "IDC 6 - קומה 6", time: "08:30-09:30" },
  { postId: "patrol-preliminary-2", location: "IDC 6 - קומה 6", time: "14:30-15:30" },
  { postId: "patrol-satellite-night", location: "IDC 6 - קומה 6", time: "22:00-23:00" },
  { postId: "patrol-satellite-morning-weekend", location: "IDC 6 - קומה 6", time: "08:00-09:00" },
  { postId: "patrol-satellite-afternoon-weekend", location: "IDC 6 - קומה 6", time: "16:00-17:00" },

  // IDC7.1.2
  { postId: "patrol-preliminary-1", location: "IDC7.1.2", time: "07:00-09:00", remark: "סריקה חיצונית + 7.3" },
  { postId: "patrol-preliminary-2", location: "IDC7.1.2", time: "10:40-12:00", remark: "סריקה מלאה" },
  { postId: "patrol-satellite-afternoon", location: "IDC7.1.2", time: "19:30-21:00" },
  { postId: "patrol-satellite-night", location: "IDC7.1.2", time: "22:00-23:00", remark: "סריקה חיצונית" },
  { postId: "patrol-satellite-night", location: "IDC7.1.2", time: "23:00-02:00", remark: "סריקה מלאה" },
  { postId: "patrol-satellite-morning-weekend", location: "IDC7.1.2", time: "09:00-10:00" },
  { postId: "patrol-satellite-afternoon-weekend", location: "IDC7.1.2", time: "17:00-18:00" },

  // IDC7.3
  { postId: "patrol-preliminary-1", location: "IDC7.3", time: "10:00-11:30", remark: "סריקה מלאה" },
  { postId: "patrol-satellite-afternoon", location: "IDC7.3", time: "19:30-21:00" },
  { postId: "patrol-satellite-night", location: "IDC7.3", time: "22:00-23:00", remark: "סריקה חיצונית" },
  { postId: "patrol-satellite-night", location: "IDC7.3", time: "23:00-02:00", remark: "סריקה מלאה" },
  { postId: "patrol-satellite-morning-weekend", location: "IDC7.3", time: "09:00-10:00" },
  { postId: "patrol-satellite-afternoon-weekend", location: "IDC7.3", time: "17:00-18:00" },

  // גייטהאוס תגבור
  { postId: "patrol-9-morning", location: "גייטהאוס תגבור", time: "07:00-10:00" },
  { postId: "patrol-9-morning", location: "גייטהאוס תגבור", time: "12:30-13:30" },
  { postId: "patrol-9-afternoon", location: "גייטהאוס תגבור", time: "13:30-17:00" },
  { postId: "patrol-satellite-night", location: "גייטהאוס תגבור", time: "02:00-03:00", remark: "חילוף עם גייט" },

  // IDC9
  { postId: "patrol-9-morning", location: "IDC9", time: "10:00-12:30", remark: "סריקה מלאה" },
  { postId: "patrol-9-morning", location: "IDC9", time: "13:30-15:00", remark: "שהייה בבניין 9" },
  { postId: "patrol-9-afternoon", location: "IDC9", time: "17:00-20:00", remark: "סריקה מלאה" },
  { postId: "security-sl-night", location: "IDC9", time: "02:00-04:00", remark: "קומות 1+2 data center + ברצלונה" },
  { postId: "security-sl-weekend", location: "IDC9", time: "09:00-13:00", remark: "סריקה מלאה" },
  { postId: "security-sl-weekend", location: "IDC9", time: "15:00-18:00", remark: "סריקה מלאה" },
];
