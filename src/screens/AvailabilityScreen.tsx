import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import AvailabilityButton from '../components/AvailabilityButton/AvailabilityButton';
import { getWeekDates } from '../utils/dateUtils';
import CustomButton from '../components/CustomButton/CustomButton';
import { Timestamp, doc, setDoc } from "firebase/firestore";
import useUser from '../hooks/useUser';
import { db } from '../services/firebaseConfig';
import { fetchUsers } from '../store/api/fetchUsers.api';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { updateAvailability } from '../store/actions';
import useRefresh from '../hooks/useRefresh';
import { Colors } from '../constants';

export default function AvailabilityScreen() {
  const user = useUser();
  const dispatch = useDispatch();

  const today = new Date();
  const nextWeekStart = new Date();
  nextWeekStart.setDate(today.getDate() + (7 - today.getDay())); // начало следующей недели

  const [currentWeekStart, setCurrentWeekStart] = useState(nextWeekStart);
  const [week, setWeek] = useState(getWeekDates(currentWeekStart, 0, 'he-IL'));

  const [isPrevWeekBlocked, setPrevWeekBlocked] = useState(true);

  const [weekAvailabilityState, setWeekAvailabilityState] = useState<boolean[][]>(
    week.map((day, i) => user?.availability?.[i]?.statuses ?? [true, true, true])
  );

  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
  if (!user || !currentWeekStart) return;

  const newW = getWeekDates(currentWeekStart, 0, 'he-IL');
  setWeek(newW);

  const newReq = newW.map((day) => {
    const ex = user?.availability?.find(
      (r) => r.date.toDate().toDateString() === day.date.toDateString()
    );
    return ex?.statuses ?? [true, true, true];
  });

  setWeekAvailabilityState(newReq);
}, [user, currentWeekStart]);

  const refresh = useRefresh();

  const updateDay = (index: number, statuses: boolean[]) => {
    setWeekAvailabilityState((prev) => {
      const copy = [...prev];
      copy[index] = statuses;
      return copy;
    });
  };

  const handleSend = async () => {
    if (!user) return;

    const newWeekAvailability = week.map((item, i) => ({
      date: Timestamp.fromDate(item.date),
      statuses: weekAvailabilityState[i] ?? [true, true, true],
    }));

    const oldAvailability = user.availability ?? [];

    const today = new Date();
    const filteredOld = oldAvailability.filter((req) => {
      return req.date.toDate() >= today;
    });

    const currentWeekDates = week.map((d) => d.date.toDateString());
    const withoutCurrentWeek = filteredOld.filter((req) => {
      return !currentWeekDates.includes(req.date.toDate().toDateString());
    });

    const mergedAvailability = [...withoutCurrentWeek, ...newWeekAvailability];

    setIsSending(true);
    dispatch(updateAvailability({user, availability: newWeekAvailability}))
    await setDoc(
      doc(db, "users", user.id),
      { availability: mergedAvailability },
      { merge: true }
    );
    setSentSuccess(true);
    fetchUsers(dispatch);
    setTimeout(() => setSentSuccess(false), 3000);
    setIsSending(false);

  };


  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
    setWeek(getWeekDates(next, 0, 'he-IL'));
    setPrevWeekBlocked(false);

    const newReq = getWeekDates(next, 0, 'he-IL').map((day) => {
      const ex = user?.availability?.find((r) =>
        r.date.toDate().toDateString() === day.date.toDateString()
      );
      return ex?.statuses ?? [true, true, true];
    });
    setWeekAvailabilityState(newReq);
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);

    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getDay());
    const nextAllowed = new Date(startOfThisWeek);
    nextAllowed.setDate(nextAllowed.getDate());

    if (prev < nextAllowed) return;

    setCurrentWeekStart(prev);
    const newW = getWeekDates(prev, 0, 'he-IL');
    setWeek(newW);

    const newReq = newW.map((day) => {
      const ex = user?.availability?.find((r) =>
        r.date.toDate().toDateString() === day.date.toDateString()
      );
      return ex?.statuses ?? [true, true, true];
    });
    setWeekAvailabilityState(newReq);

    const prevAgain = new Date(prev);
    prevAgain.setDate(prevAgain.getDate() - 7);

    if (prevAgain < nextAllowed) {
      setPrevWeekBlocked(true);
    } else {
      setPrevWeekBlocked(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh.onRefresh} />}
        data={week}
        keyExtractor={(item) => item.date.toISOString()}
        renderItem={({ item, index }) => (
          <View style={{ marginBottom: 8 }}>
            <AvailabilityButton
              date={item.date}
              statuses={weekAvailabilityState[index]}
              onChange={(newStatuses) => updateDay(index, newStatuses)}
            />
          </View>
        )}
      />

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <CustomButton
          title={<Ionicons name="chevron-back" size={20} />}
          onHandle={handleNextWeek}
        />
        <CustomButton
          style={{ flex: 1 }}
          title={
            isSending
              ? <ActivityIndicator color={Colors.mainDark} />
              : sentSuccess
                ? "נשלח!"
                : "שלח"
          }
          onHandle={handleSend}
          disabled={isSending}
        />
        <CustomButton
          title={<Ionicons name="chevron-forward" size={20} />}
          onHandle={handlePrevWeek}
          disabled={isPrevWeekBlocked}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8, backgroundColor: 'rgb(242,242,242)' },
});
