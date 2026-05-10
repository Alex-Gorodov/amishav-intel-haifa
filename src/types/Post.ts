import { GuardTask } from "./GuardTask";
import { RoleValue } from "./User";

export type Post = {
  id: string;
  title: string;
  tasks?: GuardTask[];
  hourlyRate: number;
  defaultStartTime: string;
  defaultEndTime: string;
  role: RoleValue;
  isMultiple?: boolean;
}
