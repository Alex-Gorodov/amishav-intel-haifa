import { Post } from "../types/Post";
import { Tariffs } from "./Tariffs";

export const SECURITY_POSTS: Post[] = [
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

export const OCC_POSTS: Post[] = [
  { id: "controller-1-morning", title: "בקר 1", defaultStartTime: "06:45", defaultEndTime: "14:45", hourlyRate: 48, role: "controller" },
  { id: "controller-2-morning", title: "בקר 2 (עד 16:00)", defaultStartTime: "06:45", defaultEndTime: "14:45", hourlyRate: 48, role: "controller" },
  { id: "controller-evening", title: "בקר ערב", defaultStartTime: "14:15", defaultEndTime: "22:15", hourlyRate: 48, role: "controller" },

  { id: "controller-night", title: "בקר לילה", defaultStartTime: "21:45", defaultEndTime: "07:15", hourlyRate: 48, role: "controller" },

  { id: "supervisor-evening", title: "אחמ\"ש בקרה ערב", defaultStartTime: "14:15", defaultEndTime: "22:15", hourlyRate: 57, role: "supervisor" },
  { id: "supervisor-morning", title: "אחמ\"ש בקרה בוקר", defaultStartTime: "06:45", defaultEndTime: "14:45", hourlyRate: 57, role: "supervisor" },
  { id: "supervisor-night", title: "אחמ\"ש בקרה לילה", defaultStartTime: "21:45", defaultEndTime: "07:15", hourlyRate: 57, role: "supervisor" },

  { id: "shift-manager-morning", title: "מנהל משמרת חמוש בוקר", defaultStartTime: "06:00", defaultEndTime: "14:00", hourlyRate: Tariffs.shiftManager, role: 'shift_manager'},
  { id: "shift-manager-afternoon", title: "מנהל משמרת חמוש צהריים", defaultStartTime: "13:30", defaultEndTime: "22:00", hourlyRate: Tariffs.shiftManager, role: 'shift_manager'},
  { id: "shift-manager-night", title: "מנהל משמרת חמוש לילה", defaultStartTime: "21:30", defaultEndTime: "06:30", hourlyRate: Tariffs.shiftManager, role: 'shift_manager'},
];

export const DERT_POSTS: Post[] = [
  { id: "dert-evening", title: "רספונדר ערב", defaultStartTime: "14:45", defaultEndTime: "23:15", hourlyRate: 49, role: "dert_member" },
  { id: "dert-morning", title: "רספונדר בוקר", defaultStartTime: "06:45", defaultEndTime: "15:15", hourlyRate: 49, role: "dert_member" },
  { id: "dert-night", title: "רספונדר לילה", defaultStartTime: "23:00", defaultEndTime: "07:15", hourlyRate: 49, role: "dert_member" },

  { id: "dert-leader-evening", title: "אחמ״ש חירום ערב", defaultStartTime: "14:45", defaultEndTime: "23:15", hourlyRate: 52, role: "dert_leader" },
  { id: "dert-leader-morning", title: "אחמ״ש חירום בוקר", defaultStartTime: "06:45", defaultEndTime: "15:15", hourlyRate: 52, role: "dert_leader" },
  { id: "dert-leader-night", title: "אחמ״ש חירום לילה", defaultStartTime: "23:00", defaultEndTime: "07:15", hourlyRate: 52, role: "dert_leader" },

  { id: "shift-manager-morning", title: "מנהל משמרת חמוש בוקר", defaultStartTime: "06:00", defaultEndTime: "14:00", hourlyRate: Tariffs.shiftManager, role: 'shift_manager'},
  { id: "shift-manager-afternoon", title: "מנהל משמרת חמוש צהריים", defaultStartTime: "13:30", defaultEndTime: "22:00", hourlyRate: Tariffs.shiftManager, role: 'shift_manager'},
  { id: "shift-manager-night", title: "מנהל משמרת חמוש לילה", defaultStartTime: "21:30", defaultEndTime: "06:30", hourlyRate: Tariffs.shiftManager, role: 'shift_manager'},
];

export const ALL_POSTS: Post[] = [
  ...SECURITY_POSTS,
  ...OCC_POSTS,
  ...DERT_POSTS,
];

export const ALL_SHIFTS_LIST: Post[] = [
  ...SECURITY_POSTS,
  ...OCC_POSTS.filter((p) => p.id.includes('shift-manager')),
  ...DERT_POSTS.filter((p) => p.id.includes('shift-manager')),
];

export const SECURITY_ROLES = [
  "security_guard",
  "security_shift_leader",
  "shift_manager",
];

export const DERT_ROLES = [
  "dert_member",
  "dert_leader",
  "shift_manager",
];

export const OCC_ROLES = [
  "controller",
  "supervisor",
  "shift_manager",
];

export const SHIFT_MANAGER_ROLE = "shift_manager";

export const SecurityPostsOrder = [
  { id: "gatehouse-morning"},
  { id: "gatehouse-afternoon"},
  { id: "gatehouse-night"},

  { id: "security-sl-morning"},
  { id: "security-sl-afternoon"},

  { id: "patrol-satellite-morning"},
  { id: "patrol-satellite-afternoon"},
  { id: "patrol-satellite-night"},

  { id: "patrol-preliminary-2"},

  { id: "patrol-main-morning"},
  { id: "gatehouse-reinforcement"},
  { id: "patrol-9-afternoon"},

  { id: "shift-manager-morning"},
  { id: "shift-manager-afternoon"},
  { id: "shift-manager-night"},
];

export const DertPostsOrder = [
  { id: 'dert-morning'},
  { id: 'dert-leader-morning'},
  { id: "shift-manager-morning"},
  { id: 'dert-evening'},
  { id: 'dert-leader-evening'},
  { id: "shift-manager-afternoon"},
  { id: 'dert-night'},
  { id: 'dert-leader-night'},
  { id: "shift-manager-night"},
];

export const OccPostsOrder = [
  { id: 'controller-1-morning'},
  { id: 'controller-2-morning'},
  { id: 'supervisor-morning'},
  { id: "shift-manager-morning"},
  { id: 'controller-evening'},
  { id: 'supervisor-evening'},
  { id: "shift-manager-afternoon"},
  { id: 'controller-night'},
  { id: 'supervisor-night'},
  { id: "shift-manager-night"},
]

export const ROLE_TO_DEFAULT_SCHEDULE: Record<string, "security" | "occ" | "dert"> = {
  controller: "occ",
  supervisor: "occ",

  security_guard: "security",
  security_shift_leader: "security",

  dert_member: "dert",
  dert_leader: "dert",

  shift_manager: "security",
};

export const ROLE_VISIBILITY: Record<string, string[]> = {
  controller: ["controller", "supervisor", "shift_manager"],
  supervisor: ["controller", "supervisor", "shift_manager"],

  security_guard: ["security_guard", "security_shift_leader", "shift_manager"],
  security_shift_leader: ["security_guard", "security_shift_leader", "shift_manager"],

  dert_member: ["dert_member", "dert_leader", "shift_manager"],
  dert_leader: ["dert_member", "dert_leader", "shift_manager"],

  shift_manager: [
    "controller",
    "supervisor",
    "shift_manager",
    "security_guard",
    "security_shift_leader",
    "dert_member",
    "dert_leader",
  ],
};
