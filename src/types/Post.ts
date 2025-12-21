import { GuardTask } from "./GuardTask";

export type Post = {
  id: string;
  title: string;
  tasks?: GuardTask[];
  hourlyRate: number;
  defaultStartTime: string;
  defaultEndTime: string;
}
