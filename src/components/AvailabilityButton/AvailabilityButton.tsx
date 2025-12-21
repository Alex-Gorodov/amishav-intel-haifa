import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors, MONTHS } from '../../constants';

interface AvailabilityButtonProps {
  date: Date;
  statuses: boolean[];
  onChange?: (newStatuses: boolean[]) => void;
}

export default function AvailabilityButton({ date, statuses, onChange }: AvailabilityButtonProps) {
  const dateToSet = `${date.toLocaleDateString('he-IL', { weekday: 'short' })}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;

  const [selected, setSelected] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (statuses && statuses.length === 3) {
      setSelected(statuses.map(s => s ?? false));
    }
  }, [statuses]);

  const toggle = (index: number) => {
    const next = [...selected];
    next[index] = !next[index];
    setSelected(next);
    onChange?.(next);
  };

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
    <View style={styles.wrapper}>
      <Text style={styles.dateText}>{dateToSet}</Text>
      <View style={styles.card}>
        {renderButton('לילה', 2, { borderBottomLeftRadius: 20 })}
        {renderButton('צהריים', 1)}
        {renderButton('בוקר', 0, { borderBottomRightRadius: 20 })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.mainDark,
    borderRadius: 20,
    overflow: 'hidden',
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
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.mainDark,
  },
});
