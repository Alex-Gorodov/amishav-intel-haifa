import { Timestamp } from 'firebase/firestore';
import { getWeekDates } from '../utils/dateUtils';
import { Posts } from './Posts';
import { User } from '../types/User';

const ref = new Date();
ref.setDate(ref.getDate());
const week = getWeekDates(ref, 0, 'he-IL').map(w => w.date);

function pickPostById(id: string) {
  return Posts.find(p => p.id === id) as any;
}

function makeShift(id: string, date: Date, postId: string, start?: string, end?: string, remark?: string) {
  const post = pickPostById(postId);
  return {
    id,
    date: Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate())),
    post,
    startTime: start ?? post?.defaultStartTime,
    endTime: end ?? post?.defaultEndTime,
    remark,
  };
}

// Простая helper чтобы генерировать availability (в формате [morning, afternoon, night])
function makeAvailability(date: Date, morning = true, afternoon = true, night = false) {
  return {
    date: Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate())),
    statuses: [morning, afternoon, night],
  };
}

export const FullWeekMockUsers: User[] = [
  // User 1 - Patrol main (covers morning shifts Mon..Sun)
  ({
    id: 'u1',
    passportId: '100000001',
    firstName: 'איתן',
    secondName: 'לוי',
    roles: ['security_guard'],
    email: 'eitan@example.com',
    phoneNumber: '+972501234001',
    documents: [],
    availability: week.map(d => makeAvailability(d, true, false, false)),
    shifts: week.map((d, i) => makeShift(`s-u1-${i}`, d, 'patrol-main-morning')),
  } as unknown) as User,

  // User 2 - Patrol main afternoon
  ({
    id: 'u2',
    passportId: '100000002',
    firstName: 'דניאל',
    secondName: 'כהן',
    roles: ['security_guard'],
    email: 'daniel@example.com',
    phoneNumber: '+972501234002',
    documents: [],
    availability: week.map(d => makeAvailability(d, false, true, false)),
    shifts: week.map((d, i) => makeShift(`s-u2-${i}`, d, 'patrol-main-afternoon')),
  } as unknown) as User,

  // User 3 - Security SL night (covers nights)
  ({
    id: 'u3',
    passportId: '100000003',
    firstName: 'משה',
    secondName: 'סגל',
    roles: ['security_shift_leader'],
    email: 'moshe@example.com',
    phoneNumber: '+972501234003',
    documents: [],
    availability: week.map(d => makeAvailability(d, false, false, true)),
    shifts: week.map((d, i) => makeShift(`s-u3-${i}`, d, 'security-sl-night')),
  } as unknown) as User,

  // User 4 - Gatehouse mixed
  ({
    id: 'u4',
    passportId: '100000004',
    firstName: 'נועה',
    secondName: 'אביב',
    roles: ['security_guard'],
    email: 'noa@example.com',
    phoneNumber: '+972501234004',
    documents: [],
    availability: week.map((d, idx) => makeAvailability(d, idx % 2 === 0, idx % 2 === 1, false)),
    shifts: week.map((d, i) => makeShift(`s-u4-${i}`, d, i % 2 === 0 ? 'gatehouse-morning' : 'gatehouse-afternoon')),
  } as unknown) as User,

  // User 5 - Patrol 9 split
  ({
    id: 'u5',
    passportId: '100000005',
    firstName: 'ורד',
    secondName: 'רוזן',
    roles: ['security_guard'],
    email: 'vered@example.com',
    phoneNumber: '+972501234005',
    documents: [],
    availability: week.map((d, idx) => makeAvailability(d, true, true, false)),
    shifts: week.map((d, i) => makeShift(`s-u5-${i}`, d, i % 2 === 0 ? 'patrol-9-morning' : 'patrol-9-afternoon')),
  } as unknown) as User,

  // User 6 - Satellite patrols
  ({
    id: 'u6',
    passportId: '100000006',
    firstName: 'אייל',
    secondName: 'ברק',
    roles: ['security_guard'],
    email: 'eyal@example.com',
    phoneNumber: '+972501234006',
    documents: [],
    availability: week.map(() => makeAvailability(new Date(), true, true, true)),
    shifts: week.map((d, i) => makeShift(`s-u6-${i}`, d, i % 3 === 0 ? 'patrol-satellite-afternoon' : (i % 3 === 1 ? 'patrol-satellite-night' : 'patrol-preliminary-1'))),
  } as unknown) as User,

  // User 7 - Shift manager covering mixed times
  ({
    id: 'u7',
    passportId: '100000007',
    firstName: 'רוני',
    secondName: 'משה',
    roles: ['shift_manager'],
    email: 'roni@example.com',
    phoneNumber: '+972501234007',
    documents: [],
    availability: week.map(d => makeAvailability(d, true, true, true)),
    shifts: week.map((d, i) => makeShift(`s-u7-${i}`, d, i % 2 === 0 ? 'shift-manager-morning' : 'shift-manager-afternoon')),
  } as unknown) as User,

  // User 8 - security SL afternoon on weekend examples
  ({
    id: 'u8',
    passportId: '100000008',
    firstName: 'אלי',
    secondName: 'כהן',
    roles: ['security_shift_leader'],
    email: 'ali@example.com',
    phoneNumber: '+972501234008',
    documents: [],
    availability: week.map((d, idx) => makeAvailability(d, idx === 5 || idx === 6, true, false)),
    shifts: week.map((d, i) => {
      // on weekend (index 5/6) set morning/afternoon weekend style posts for some users
      const isWeekend = [5, 6].includes(i);
      const postId = isWeekend ? (i % 2 === 0 ? 'security-sl-morning-weekend' : 'security-sl-afternoon-weekend') : (i % 2 === 0 ? 'security-sl-morning' : 'security-sl-afternoon');
      return makeShift(`s-u8-${i}`, d, postId);
    }),
  } as unknown) as User,
];

export default FullWeekMockUsers;
