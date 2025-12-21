import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { getIsoLocalDateKey } from '../utils/getIsoLocalDateKey';
import React, { useMemo, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useUser from '../hooks/useUser';

const { width } = Dimensions.get('window');
const NUM_DAYS_IN_WEEK = 7;
const DAY_MARGIN = 0.47;

const DAY_SIZE = (width - DAY_MARGIN * (NUM_DAYS_IN_WEEK * 2)) / NUM_DAYS_IN_WEEK;

export default function UserMonthCalendarScreen() {

  const user = useUser();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [displayDate, setDisplayDate] = useState(new Date());

  const goToPrevMonth = () => {
  const d = new Date(displayDate);
  d.setMonth(d.getMonth() - 1);
  setSelectedDate(null);
  setDisplayDate(d);
};

const goToNextMonth = () => {
  const d = new Date(displayDate);
  d.setMonth(d.getMonth() + 1);
  setSelectedDate(null);
  setDisplayDate(d);
};

const shiftsByDate = useMemo(() => {
  const map: Record<string, any> = {};

  (user?.shifts ?? []).forEach(shift => {
    const d = shift.date.toDate();

    if (
      d.getMonth() === displayDate.getMonth() &&
      d.getFullYear() === displayDate.getFullYear()
    ) {
      map[getIsoLocalDateKey(d)] = shift;
    }
  });

  return map;
}, [user?.shifts, displayDate]);


const daysInMonth = useMemo(() => {
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}, [displayDate]);



  const selectedShift = selectedDate ? shiftsByDate[selectedDate] : null;

  return (
    <View style={styles.container}>
      {/* MONTH NAV */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={goToPrevMonth}>
          <Ionicons name="chevron-back" size={20} />
        </TouchableOpacity>

        <Text style={styles.monthLabel}>
          {displayDate.toLocaleString('he-IL', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        <TouchableOpacity onPress={goToNextMonth}>
          <Ionicons name="chevron-forward" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.calendar}>
        {daysInMonth.map((date, index) => {
          if (!date) {
            return <View key={index} style={styles.day} />;
          }

          const key = getIsoLocalDateKey(date);
          const hasShift = !!shiftsByDate[key];
          const isSelected = key === selectedDate;

          return (
            <Pressable
              key={key}
              style={[
                styles.day,
                hasShift && styles.workDay,
                isSelected && styles.selectedDay,
              ]}
              onPress={() => setSelectedDate(key)}
            >
              <Text style={styles.dayText}>{date.getDate()}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* DETAILS */}
        <View style={styles.details}>
          {(() => {
            // Если дата не выбрана
            if (!selectedDate) {
              return <Text style={styles.placeholder}>בחר יום בלוח השנה</Text>;
            }

            // Если дата выбрана, но смены на неё нет
            const selectedShift = shiftsByDate[selectedDate];
            if (!selectedShift) {
              return <Text style={styles.placeholder}>אין משמרת ביום זה</Text>;
            }

            // Если дата выбрана и смена есть
            return (
              <View>
                <Text style={styles.detailTitle}>פרטי משמרת</Text>
                <Text>עמדה: {selectedShift.post.title}</Text>
                <Text>
                  שעות: {selectedShift.startTime} – {selectedShift.endTime}
                </Text>
                {selectedShift.remark && (
                  <Text>הערה: {selectedShift.remark}</Text>
                )}
              </View>
            );
          })()}
        </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

calendar: {
  width: '100%',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start', // чтобы отступы правильно применялись
  borderBottomWidth: 1,
  borderColor: '#eee',
},


  day: {
  width: DAY_SIZE,
  height: DAY_SIZE,
  justifyContent: 'center',
  alignItems: 'center',
  margin: DAY_MARGIN,
  borderWidth: 0.5,
  borderColor: '#eee',
},


  workDay: {
    backgroundColor: '#DFF5E1', // зелёный
  },

  selectedDay: {
    borderWidth: 2,
    borderColor: '#4BB543',
  },

  dayText: {
    fontWeight: '600',
  },

  details: {
    flex: 1,
    padding: 16,
  },

  placeholder: {
    textAlign: 'center',
    color: '#999',
    marginTop: 24,
  },

  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },

  monthNav: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 10,
  backgroundColor: '#fafafa',
  borderBottomWidth: 1,
  borderColor: '#eee',
},

monthLabel: {
  fontSize: 16,
  fontWeight: '700',
  marginHorizontal: 12,
  minWidth: 140,
  textAlign: 'center',
},

});
