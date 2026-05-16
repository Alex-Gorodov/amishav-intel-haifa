import { Post } from "../types/Post";
import { Tariffs } from "./Tariffs";


export const Posts: Post[] = [
  { id: "gatehouse-morning", title: "גייטהאוס בוקר", defaultStartTime: "06:30", defaultEndTime: "15:00", hourlyRate: Tariffs.securityGuard, role: 'security_guard'},
  { id: "gatehouse-afternoon", title: "גייטהאוס צהריים", defaultStartTime: "14:45", defaultEndTime: "22:00" , hourlyRate: Tariffs.securityGuard, role: 'security_guard'},
  { id: "gatehouse-night", title: "גייטהאוס לילה", defaultStartTime: "21:45", defaultEndTime: "07:00", hourlyRate: Tariffs.securityGuard, role: 'security_guard'},

  { id: "security-sl-morning", title: "אחמ״ש אבטחה בוקר", defaultStartTime: "06:00", defaultEndTime: "14:00", hourlyRate: Tariffs.securityShiftLeader, role: 'security_shift_leader'},
  { id: "security-sl-afternoon", title: "אחמ״ש אבטחה צהריים", defaultStartTime: "13:30", defaultEndTime: "22:15", hourlyRate: Tariffs.securityShiftLeader, role: 'security_shift_leader'},

  { id: "patrol-satellite-morning", title: "סייר לווינים בוקר", defaultStartTime: "06:30", defaultEndTime: "15:00", hourlyRate: Tariffs.securityGuard, role: 'security_guard'},
  { id: "patrol-satellite-afternoon", title: "סייר לווינים צהריים", defaultStartTime: "12:00", defaultEndTime: "22:00", hourlyRate: Tariffs.securityGuard, role: 'security_guard'},
  { id: "patrol-satellite-night", title: "סייר לווינים לילה", defaultStartTime: "21:45", defaultEndTime: "07:00", hourlyRate: Tariffs.securityGuard, role: 'security_guard'},

  { id: "patrol-preliminary-2", title: "סייר מקדים 2 (עד 17:00)", defaultStartTime: "06:30", defaultEndTime: "17:00", hourlyRate: Tariffs.securityGuard, role: 'security_guard'},

  { id: "patrol-main-morning", title: "סייר ראשי בוקר", defaultStartTime: "06:30", defaultEndTime: "16:00", hourlyRate: Tariffs.securityGuard, role: 'security_guard'},
  { id: "gatehouse-reinforcement", title: "תגבור גייט", defaultStartTime: "06:30", defaultEndTime: "15:00", hourlyRate: Tariffs.securityGuard, role: 'security_guard'},
  { id: "patrol-9-afternoon", title: "סייר 9 צהריים", defaultStartTime: "11:30", defaultEndTime: "20:00", hourlyRate: Tariffs.securityGuard, role: 'security_guard'},

  { id: "shift-manager-morning", title: "מנהל משמרת חמוש בוקר", defaultStartTime: "06:00", defaultEndTime: "14:00", hourlyRate: Tariffs.shiftManager, role: 'shift_manager'},
  { id: "shift-manager-afternoon", title: "מנהל משמרת חמוש צהריים", defaultStartTime: "13:30", defaultEndTime: "22:00", hourlyRate: Tariffs.shiftManager, role: 'shift_manager'},
  { id: "shift-manager-night", title: "מנהל משמרת חמוש לילה", defaultStartTime: "21:30", defaultEndTime: "06:30", hourlyRate: Tariffs.shiftManager, role: 'shift_manager'},
];
