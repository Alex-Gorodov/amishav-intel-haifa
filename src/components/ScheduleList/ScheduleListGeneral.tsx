import { ScrollView, StyleSheet, Text, View, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import React, { useMemo, useState } from 'react';
import PostsTable from '../PostsTable/PostsTable';
import { Posts } from '../../constants/Posts';
import ScheduleGrid from '../ScheduleGrid/ScheduleGrid';
import { useSelector } from 'react-redux';
import { State } from '../../types/State';
import SearchField from '../SearchField/SearchField';
import { GuardTasks } from '../../constants/GuardTasks';
import { GuardTask } from '../../types/GuardTask';

// helper: returns array of 7 Date objects for the current week starting Monday
function getCurrentWeekDates(reference = new Date(), startOfWeek: 'mon' | 'sun' = 'mon') {
  const d = new Date(reference);
  // compute monday
  const dayOfWeek = (d.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() - dayOfWeek);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    dates.push(dt);
  }

  if (startOfWeek === 'sun') {
    // Return Sunday before the Monday (so week is Sun..Sat with Sunday preceding the Monday)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() - 1);
    return [sunday, ...dates.slice(0, 6)];
  }

  return dates;
}

function isoDateKey(dt: Date) {
  return dt.toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatHeaderDate(dt: Date) {
  return dt.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric' });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function ScheduleListGeneral() {
  const users = useSelector((state: State) => state.data.users);

  const [isRemarkOpen, setRemarkOpen] = useState(false);
  const [remarkText, setRemarkText] = useState('');
  const [modalDate, setModalDate] = useState('');
  const [modalTimes, setModalTimes] = useState('');
  const [remarkTitle, setRemarkTitle] = useState('');
  const [guardTasks, setGuardTasks] = useState<GuardTask[]>([]);

  // start week on Sunday so visual order can be RTL starting with Sunday
  const weekDates = useMemo(() => getCurrentWeekDates(new Date(), 'sun'), []);
  const dateKeys = weekDates.map(isoDateKey);

  // build rows per post: each row represents a post and cells contain comma-separated user names who have that post on that date
  const rows = useMemo(() => {
    return Posts.map((post) => {
      const shiftsMap: Record<string, string | null> = {};
      dateKeys.forEach((key, idx) => {
        const day = weekDates[idx];
        // find all users who have a shift on this date for this post
        const names = users
          .filter((u) => u.shifts?.some((s) => isSameDay(s.date.toDate(), day) && s.post.id === post.id))
          .map((u) => `${u.firstName} ${u.secondName}`);
        shiftsMap[key] = names.length ? names.join(', ') : null;
      });

      return {
        id: post.id,
        name: post.title,
        shifts: shiftsMap,
      };
    });
  }, [users, dateKeys]);

  return (
    <View style={styles.container}>
      <ScheduleGrid
        dates={dateKeys}
        rows={rows}
        cellWidth={96}
        onCellPress={(postId, dateKey) => {
          const dayIndex = dateKeys.indexOf(dateKey);
          const day = weekDates[dayIndex];

          const parts: string[] = [];
          const times = new Set<string>();

          users.forEach((u) => {
            u.shifts?.forEach((s) => {
              if (s.post?.id === postId && isSameDay(s.date.toDate(), day)) {
                const start = s.post?.defaultStartTime ?? '';
                const end = s.post?.defaultEndTime ?? '';
                const time = (start || end) ? `${start} - ${end}` : '';
                if (time) times.add(time);

                const rem = s.remark ? s.remark : '';
                parts.push(`${rem ? `\n${rem}` : `\nאין הערות`}`);
              }
            });
          });

          // 🟦 ВАЖНО: найти задачи для конкретного поста
          const postTasks = GuardTasks.filter(t => t.postId === postId);
          setGuardTasks(postTasks);

          const text = parts.length ? parts.join('\n\n') : '';

          const postFromConst = Posts.find((p) => p.id === postId);
          const title = postFromConst ? postFromConst.title : postId;

          setRemarkTitle(title);
          const formattedDate = formatHeaderDate(day);
          setModalDate(formattedDate);
          setModalTimes(Array.from(times).join(', '));
          setRemarkText(text);
          setRemarkOpen(true);
        }}

      />
      <Modal transparent visible={isRemarkOpen} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setRemarkOpen(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback>
              <View style={{ width: '80%', backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <View>
                    <Text>{modalDate}</Text>
                    <Text>{modalTimes}</Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'right' }}>{remarkTitle}</Text>
                </View>
                <View>
                  <Text style={{ fontWeight: '600', marginBottom: 8, textAlign: 'right' }}>
                    מסימות:
                  </Text>

                  {guardTasks
                    .sort((a, b) => {
                      const aStart = a.time.split('-')[0];
                      const bStart = b.time.split('-')[0];
                      return aStart.localeCompare(bStart);
                    }).map((task, i) => (
                    <View style={{marginBottom: 8}} key={i}>
                      <View style={{flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginBottom: -4}}>
                        <Text>{task.location}</Text>
                        <Text>{task.time}</Text>
                      </View>
                      {task.remark && <Text style={{textAlign: 'right', fontSize: 12, color: '#898989'}}>{task.remark}</Text>}
                    </View>
                  ))}
                </View>

                <Text style={{ marginBottom: 12, textAlign: 'right' }}>{remarkText}</Text>
                <TouchableOpacity onPress={() => setRemarkOpen(false)} style={{ alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#333', borderRadius: 8 }}>
                  <Text style={{ color: '#fff' }}>סגור</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: '100%', backgroundColor: 'rgb(242,242,242)' },
});
