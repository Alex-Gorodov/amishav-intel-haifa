import { RefreshControl, ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { SimpleToggle } from '../components/CustomToggle/CustomToggle'
import ScheduleListGeneral from '../components/ScheduleList/ScheduleListGeneral'
import ScheduleListPrivate from '../components/ScheduleList/ScheduleListPrivate'
import { useDispatch } from 'react-redux'
import { fetchUsers } from '../store/api/fetchUsers.api'
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, SCREEN_HEIGHT } from '../constants'

function getWeekByOffset(offset = 0): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  today.setDate(today.getDate() + offset * 7);

  const day = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day);

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    week.push(d);
  }

  return week;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate(dt: Date) {
  const dd = dt.getDate().toString().padStart(2, "0");
  const mm = (dt.getMonth() + 1).toString().padStart(2, "0");
  return `${dd}.${mm}`;
}

export default function ScheduleScreen() {
  const [isActive, setIsActive] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const dispatch = useDispatch();

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchUsers(dispatch);
  }, [dispatch]);

  const weekDates = useMemo(() => getWeekByOffset(weekOffset), [weekOffset]);
  const dateKeys = useMemo(() => weekDates.map(dateKey), [weekDates]);

  function getWeekLabel() {
    if (weekOffset === -1) return "שבוע שעבר";
    if (weekOffset === 0) return "שבוע נוכחי";
    if (weekOffset === 1) return "שבוע הבא";

    const start = formatDate(weekDates[0]);
    const end = formatDate(weekDates[6]);
    return `${start} - ${end}`;
  }

  return (
    <View>

      <View style={styles.topButtonsWrapper}>
        <SimpleToggle
          value={isActive}
          onChange={setIsActive}
          leftLabel="אישי"
          rightLabel="כללי"
        />
      </View>

      <View style={styles.weekNavWrapper}>

        <TouchableOpacity
          onPress={() => setWeekOffset(prev => prev + 1)}
          style={{paddingHorizontal: 32, paddingVertical: 12}}
        >
          <Ionicons name="chevron-forward-outline" size={26}/>
        </TouchableOpacity>

        <Text style={styles.weekLabel}>{getWeekLabel()}</Text>

        <TouchableOpacity
          onPress={() => setWeekOffset(prev => prev - 1)}
          style={{paddingHorizontal: 32, paddingVertical: 12}}
        >
          <Ionicons name="chevron-back-outline" size={26}/>
        </TouchableOpacity>

      </View>

      {!isActive ? (
        <ScrollView
          style={{ height: SCREEN_HEIGHT - 220}}
          refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        >
          <ScheduleListPrivate weekDates={weekDates} />
        </ScrollView>
      ) : (
        <ScheduleListGeneral weekDates={weekDates} />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  topButtonsWrapper: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: Colors.mainLight,
    zIndex: 10,
  },
  weekNavWrapper: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
