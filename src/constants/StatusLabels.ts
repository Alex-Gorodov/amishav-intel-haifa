import { RequestStatus } from "../types/Request";

export const StatusLabels: Record<RequestStatus, string> = {
  [RequestStatus.PendingUser]: 'ממתין לאישור עובד',
  [RequestStatus.PendingAdmin]: 'ממתין לאישור מנהל',
  [RequestStatus.Approved]: 'אושר',
  [RequestStatus.Rejected]: 'נדחה',
};
