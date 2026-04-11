import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors, MONTHS } from '../../constants';
import { fetchHolidaysByMonth } from '../../store/api/fetchShabbatTimes';
import { Holiday } from '../../types/ShabbatTimes';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../CustomButton/CustomButton';
import CloseButton from '../CloseButton/CloseButton';
interface AvailabilityButtonProps {
  date: Date;
  statuses: boolean[];
  onChange?: (newStatuses: boolean[]) => void;

  comment: string;
  onCommentChange: (text: string) => void;
}

export default function AvailabilityButton({ date, statuses, onChange, comment, onCommentChange }: AvailabilityButtonProps) {

  const [selected, setSelected] = useState<boolean[]>([false, false, false]);
  const [holiday, setHoliday] = useState<Holiday | null>(null);

  const [isCommentFormOpened, setCommentFormOpened] = useState(false);

  useEffect(() => {
    if (statuses && statuses.length === 3) {
      setSelected(statuses.map(s => s ?? false));
    }
  }, [statuses]);

  useEffect(() => {
    const load = async () => {
      const holidays = await fetchHolidaysByMonth(date);

      const found = holidays.find(h => {
        return (
          h.date.getFullYear() === date.getFullYear() &&
          h.date.getMonth() === date.getMonth() &&
          h.date.getDate() === date.getDate()
        );
      });

      setHoliday(found ?? null);
    };

    load();
  }, [date]);

  const baseDate = `${date.toLocaleDateString('he-IL', { weekday: 'short' })}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;

  const dateToSet = holiday
    ? `${baseDate} • ${holiday.title}`
    : baseDate;

  const toggle = (index: number) => {
    const next = [...selected];
    next[index] = !next[index];
    setSelected(next);
    onChange?.(next);
  };

  const handleSetComment = () => {
    setCommentFormOpened(!isCommentFormOpened);
  }

  const renderButton = (label: string, index: number, borderStyle?: object) => {
    const isClosed = statuses[index] === false;

    return (
      <TouchableOpacity
        onPress={() => toggle(index)}
        style={[
          styles.button,
          borderStyle,
          { backgroundColor: isClosed ? Colors.dailyStatusClosed : Colors.white }
        ]}
      >
        <Text style={[styles.text, { color: isClosed ? Colors.dailyStatusClosedText : Colors.mainDark }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
     <View
        style={[
          styles.wrapper,
          holiday && styles.holidayWrapper
        ]}
      >
      <Text style={styles.dateText}>{dateToSet}</Text>
      <Pressable style={styles.commentBtn} onPress={() => setCommentFormOpened(true)}>
        <Ionicons name='chatbox-ellipses' color={comment.length === 0 ? Colors.mainLight : Colors.primaryLight} size={20}/>
      </Pressable>
      <View style={styles.card}>
        {renderButton('לילה', 2, { borderBottomLeftRadius: 20 })}
        {renderButton('צהריים', 1)}
        {renderButton('בוקר', 0, { borderBottomRightRadius: 20 })}
      </View>
      {
        isCommentFormOpened
        &&
        <View style={[styles.commentForm, {top: holiday ? -4 : 0}]}>
          <TextInput style={styles.input} value={comment} onChangeText={onCommentChange}/>
          <CustomButton style={{backgroundColor: Colors.white, borderWidth: 0}} title={'שמור'} onHandle={() => handleSetComment()}/>
          {/* <CloseButton onHandle={() => setCommentFormOpened(false)}/> */}
        </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.mainDark,
    borderRadius: 20,
    overflow: 'hidden',
  },
  holidayWrapper: {
    borderTopWidth: 4,
    borderTopColor: '#f59e0b',
  },
  dateText: {
    padding: 4,
    textAlign: 'center',
    color: Colors.mainLight
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 0.4,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  button: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentBtn: {
    position: 'absolute',
    right: 20,
    top: 2
  },
  commentForm: {
    position: 'absolute',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    inset: 0,
    borderRadius: 20,
    padding: 8,
    gap: 8,
    zIndex: 10,
    backgroundColor: Colors.white
  },
  input: { borderWidth: 2, padding: 10, borderRadius: 16, textAlign: 'right', flex: 1 },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.mainDark,
  },
});
