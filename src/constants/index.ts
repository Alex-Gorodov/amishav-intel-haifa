import { collection } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { Dimensions } from "react-native";

export const USERS = collection(db, 'users');

export const SWAP_REQUESTS = collection(db, 'swapRequests');
export const GIVE_REQUESTS = collection(db, 'giveRequests');


export const CURRENT_DATE = new Date;

export const SCREEN_WIDTH = Dimensions.get('window').width;

export const SCREEN_HEIGHT = Dimensions.get('window').height;

export const Colors = {
  black: '#000',
  white: '#fff',
  unfocusedTabBarButton: '#999',
  primary: '#5492CA',
  primaryLight: '#73b5eeff',
  mainDark: '#333',
  mainLight: '#ddd',
  accent: '#1295aaff',
  tableBorder: '#cccccc',
  errorText: '#da0000ff',
  placeholder: '#7a7a7aff',
  progressBarBackground: '#b0b0b0ff',
  progressBarValid: '#4caf50ff',
  progressBarInvalid: '#ff5b5bff',
  progressBarAttention: '#ffc14dff',
  dailyStatusClosed: '#ffb3b3',
  dailyStatusClosedText: '#7a0f0f'
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
