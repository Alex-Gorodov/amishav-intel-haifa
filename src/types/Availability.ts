import { Timestamp } from "firebase/firestore";

export type Availability = {
  date: Timestamp;
  comment: string;
  statuses: boolean[];
}
