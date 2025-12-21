import { StyleSheet, Text, View, ActivityIndicator, Pressable } from 'react-native';
import React, { useMemo, useState } from 'react';
import useUser from '../../hooks/useUser';
import PrivateShiftCard from '../PrivateShiftCard/PrivateShiftCard';
import { useSelector } from 'react-redux';
import { State } from '../../types/State';

export default function ScheduleListPrivate({ weekDates }: { weekDates: Date[] }) {
  const user = useUser();
  const isUsersLoading = useSelector((state: State) => state.data.isUsersLoading);

  const [openMenuShiftId, setOpenMenuShiftId] = useState<string | null>(null);
  const [openInfoShiftId, setOpenInfoShiftId] = useState<string | null>(null);

  const { weekStart, weekEnd } = useMemo(() => {
    const start = new Date(weekDates[0]);
    start.setHours(0, 0, 0, 0);

    const end = new Date(weekDates[6]);
    end.setHours(23, 59, 59, 999);

    return { weekStart: start, weekEnd: end };
  }, [weekDates]);

  const weeklyShifts =
    user?.shifts
      ? [...user.shifts]
          .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime())
          .filter((s) => {
            const d = s.date.toDate();
            return d >= weekStart && d <= weekEnd;
          })
      : [];

  const handleCloseAll = () => {
    setOpenMenuShiftId(null);
    setOpenInfoShiftId(null);
  };

  return (
    <Pressable style={styles.container} onPress={handleCloseAll}>
      {isUsersLoading ? (
        <ActivityIndicator size="small" style={{ marginTop: 30 }} />
      ) : weeklyShifts.length ? (
        <View style={{ paddingBottom: 60 }}>
          {weeklyShifts.map((s) => (
            <PrivateShiftCard
              key={s.id}
              shift={s}
              onToggleMenu={() =>
                setOpenMenuShiftId(openMenuShiftId === s.id ? null : s.id)
              }
              isInfoOpen={openInfoShiftId === s.id}

              onToggleInfo={() =>
                setOpenInfoShiftId(openInfoShiftId === s.id ? null : s.id)
              }
            />
          ))}
        </View>
      ) : (
        <Text style={{fontSize: 18, fontWeight: 600, textAlign: 'center', padding: 24}}>אין עדיין משמרות</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingTop: 0,
    marginTop: 6,
    minHeight: '85%',
    backgroundColor: 'rgb(242,242,242)',
  },
});
