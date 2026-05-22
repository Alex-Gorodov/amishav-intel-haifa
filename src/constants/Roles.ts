export const Roles = [
  { value: "shift_manager", label: "מנהל משמרת" },
  { value: "supervisor", label: "אחמ״ש בקרה" },
  { value: "dert_leader", label: "אחמ״ש חירום" },
  { value: "security_shift_leader", label: "אחמ״ש ביטחון" },
  { value: "controller", label: "בקר" },
  { value: "dert_member", label: "רספונדר" },
  { value: "security_guard", label: "מאבטח" },
] as const;

export const HIGH_AUTH_ROLES = [
  "shift_manager",
  "supervisor",
  "dert_leader",
  "security_shift_leader",
];

export const STANDARD_ROLES = [
  "controller",
  "dert_member",
  "security_guard",
];
