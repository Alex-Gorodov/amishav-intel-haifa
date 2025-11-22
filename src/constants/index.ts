import { collection } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

export const USERS = collection(db, 'users');

export const CURRENT_DATE = new Date;


export const Colors = {
  primary: '#5492CA',
  primaryLight: '#73b5eeff',
  black: '#000000',
  accent: '#EFA938',
}

export const MONTHS = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר'
]
