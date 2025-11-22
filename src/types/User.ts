import { Timestamp } from "firebase/firestore";
import { Roles } from "../constants/Roles";
import { Shift } from "./Shift";
import { Availability } from "./Availability";
import { Document } from "./Document";

export type User = {
  id: string;
  passportId: string;
  firstName: string;
  secondName: string;
  roles: RoleValue[];
  shifts: Shift[];
  email: string;
  availability: Availability[];
  documents: Document[];
  isAdmin?: boolean;
  avatarUrl?: string;
  createdAt?: Timestamp;
}

export type RoleValue = typeof Roles[number]["value"];

export type Role = typeof Roles[number];
