import { Timestamp } from "firebase/firestore";

export type Availability = {
  date: Timestamp;
  statuses: boolean[];
}
