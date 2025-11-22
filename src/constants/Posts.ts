import { Post } from "../types/Post";

export const Posts: Post[] = [
  { id: "gatehouse-morning", title: "גייטהאוס בוקר", defaultStartTime: "06:30", defaultEndTime: "15:00"},
  { id: "gatehouse-afternoon", title: "גייטהאוס צהריים", defaultStartTime: "14:45", defaultEndTime: "22:00" },
  { id: "gatehouse-night", title: "גייטהאוס לילה", defaultStartTime: "21:45", defaultEndTime: "07:00" },

  { id: "gatehouse-reinforcement", title: "תגבור גייט", defaultStartTime: "06:30", defaultEndTime: "15:00"},

  { id: "security-sl-morning", title: "אחמ״ש אבטחה בוקר", defaultStartTime: "06:00", defaultEndTime: "14:00" },
  { id: "security-sl-afternoon", title: "אחמ״ש אבטחה צהריים", defaultStartTime: "13:30", defaultEndTime: "22:00" },
  { id: "security-sl-night", title: "אחמ״ש אבטחה לילה", defaultStartTime: "21:30", defaultEndTime: "06:30" },

  { id: "patrol-9-morning", title: "סייר 9 בוקר", defaultStartTime: "06:30", defaultEndTime: "15:00" },
  { id: "patrol-9-afternoon", title: "סייר 9 צהריים", defaultStartTime: "11:30", defaultEndTime: "22:00" },

  { id: "patrol-main-morning", title: "סייר ראשי בוקר", defaultStartTime: "06:30", defaultEndTime: "15:00" },
  { id: "patrol-main-afternoon", title: "סייר ראשי צהריים", defaultStartTime: "14:45", defaultEndTime: "22:00" },
  { id: "patrol-main-double-shift", title: "סייר ראשי כפולה", defaultStartTime: "08:00", defaultEndTime: "20:00" },

  { id: "patrol-satellite-afternoon", title: "סייר לווינים צהריים", defaultStartTime: "12:00", defaultEndTime: "22:00" },
  { id: "patrol-satellite-night", title: "סייר לווינים לילה", defaultStartTime: "21:45", defaultEndTime: "07:00" },

  { id: "patrol-preliminary-1", title: "סייר מקדים 1 (עד 14:00)", defaultStartTime: "06:30", defaultEndTime: "14:00" },
  { id: "patrol-preliminary-2", title: "סייר מקדים 2 (עד 17:00)", defaultStartTime: "06:30", defaultEndTime: "17:00" },

  { id: "shift-manager-morning", title: "מנהל משמרת חמוש בוקר", defaultStartTime: "06:00", defaultEndTime: "14:00" },
  { id: "shift-manager-afternoon", title: "מנהל משמרת חמוש צהריים", defaultStartTime: "13:30", defaultEndTime: "22:00" },
  { id: "shift-manager-night", title: "מנהל משמרת חמוש לילה", defaultStartTime: "21:30", defaultEndTime: "06:30" },
];
