import { GuardTask } from "./GuardTask";

export type Post = {
  id: string;
  title: string;
  tasks?: GuardTask[];
  defaultStartTime?: string;
  defaultEndTime?: string;
}
