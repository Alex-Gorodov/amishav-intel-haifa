import { Timestamp } from "firebase/firestore";
import { Post } from "./Post";

export type Shift = {
  date: Timestamp;
  post: Post;
  startTime: string;
  endTime: string;
  remark?: string;
}
