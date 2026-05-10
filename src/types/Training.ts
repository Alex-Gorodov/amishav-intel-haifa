import { Timestamp } from "firebase/firestore";

export type Training = {
  id: string;
  title: string;
  description?: string;
  updatingDate: Timestamp | null;
  validityPeriod: number;
}
