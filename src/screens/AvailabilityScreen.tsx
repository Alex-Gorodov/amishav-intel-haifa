import { View, FlatList, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import AvailabilityButton from '../components/AvailabilityButton/AvailabilityButton';
import CustomButton from '../components/CustomButton/CustomButton';
import { normalizeDate } from '../utils/getCurrentWeekDates';
import { Timestamp, doc, setDoc } from "firebase/firestore";
import { updateAvailability } from '../store/actions';
import React, { useEffect, useState } from 'react';
import { getWeekDates } from '../utils/dateUtils';
import { db } from '../services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import useRefresh from '../hooks/useRefresh';
import { useDispatch } from 'react-redux';
import useUser from '../hooks/useUser';
import { Colors } from '../constants';

export default function AvailabilityScreen() {
  const user = useUser();
  const dispatch = useDispatch();

  const today = new Date();
  const nextWeekStart = new Date();
  nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));

  const [currentWeekStart, setCurrentWeekStart] = useState(nextWeekStart);
  const [week, setWeek] = useState(getWeekDates(currentWeekStart, 0, 'he-IL'));

  const [isPrevWeekBlocked, setPrevWeekBlocked] = useState(true);
  const [comments, setComments] = useState<string[]>(week.map(() => ''));

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
        (r) => normalizeDate(r.date).toDateString() === day.date.toDateString()
      );
      return ex?.statuses ?? [true, true, true];
    });

    setWeekAvailabilityState(newReq);

    const newComments = newW.map((day) => {
      const ex = user?.availability?.find(
        (r) => normalizeDate(r.date).toDateString() === day.date.toDateString()
      );
      return ex?.comment ?? '';
    });

    setComments(newComments);
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
      comment: comments[i] || '',
      statuses: weekAvailabilityState[i] ?? [true, true, true],
    }));

    const oldAvailability = user.availability ?? [];

    const todayDate = new Date();
    const filteredOld = oldAvailability.filter((req) => {
      return normalizeDate(req.date) >= todayDate;
    });

    const currentWeekDates = week.map((d) => d.date.toDateString());
    const withoutCurrentWeek = filteredOld.filter((req) => {
      return !currentWeekDates.includes(normalizeDate(req.date).toDateString());
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
    setTimeout(() => setSentSuccess(false), 3000);
    setIsSending(false);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);

    const newW = getWeekDates(next, 0, 'he-IL');

    setCurrentWeekStart(next);
    setWeek(newW);
    setPrevWeekBlocked(false);

    const newReq = newW.map((day) => {
      const ex = user?.availability?.find((r) =>
        // ✅ FIX 5: normalizeDate inside pagination controls
        normalizeDate(r.date).toDateString() === day.date.toDateString()
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
        // ✅ FIX 6: final safe validation check
        normalizeDate(r.date).toDateString() === day.date.toDateString()
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
              comment={comments[index]}
              onCommentChange={(text) => {
                setComments(prev => {
                  const copy = [...prev];
                  copy[index] = text;
                  return copy;
                });
              }}
            />
          </View>
        )}
      />

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <CustomButton
          style={{flex: 0.25}}
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
          style={{flex: 0.25}}
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
