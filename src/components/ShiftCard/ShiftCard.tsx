import { StyleSheet, Text, View } from 'react-native';
import { getShiftSalary } from '../../utils/getShiftSalary';
import { getWeekKeyForShift } from '../../utils/getWeekKeyForShift';
import { getShiftDuration } from '../../utils/getShiftDuration';
import { getShabbatHours } from '../../utils/getShabbatHours';
import { Colors } from '../../constants';

interface ShiftCardProps {
  shift: any;
  index: number;
  shabbatByWeek: Record<string, any>;
  keyPrefix?: string;
}

export default function ShiftCard({ shift, index, shabbatByWeek, keyPrefix = 'shift' }: ShiftCardProps) {
  const shiftDate = shift.date.toDate();
  const weekKey = getWeekKeyForShift(shiftDate);
  const shabbat = shabbatByWeek[weekKey];
  const hours = getShiftDuration(shift);
  const shabbatHours = getShabbatHours(shift, shabbatByWeek);
  const normalHours = Math.max(0, Number((Number(hours) - Number(shabbatHours)).toFixed(2)));

  const salaryData = getShiftSalary(shift, shabbat);
  const isNow = (() => {
    const now = new Date();
    return shiftDate.getFullYear() === now.getFullYear() &&
      shiftDate.getMonth() === now.getMonth() &&
      shiftDate.getDate() === now.getDate();
  })();
  const backgroundColor = isNow ? '#e0f7fa' : Colors.white;

  return (
    <View key={`${keyPrefix}-${index}`} style={[styles.card, {backgroundColor}]}>
      <Text style={styles.date}>
        {shiftDate.toLocaleDateString('he-IL', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}
      </Text>
      <View style={styles.row}>
        <Text style={styles.value}>{shift.post.title}</Text>
      </View>
      {
        normalHours !== 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>⏱ שעות רגילות:</Text>
            <Text style={styles.value}>{normalHours}</Text>
          </View>
        )
      }
      {shabbatHours !== 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>🕯 שעות שבת:</Text>
          <Text style={[styles.value, styles.bold]}>{shabbatHours}</Text>
        </View>
      )}
      <View style={styles.row}>
        <Text style={styles.label}>💵 תשלום:</Text>
        <Text style={styles.pay}>{salaryData.totalPay} ₪</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.17,
    shadowRadius: 6,
    elevation: 3,
  },
  date: { textAlign: 'right', fontSize: 16, fontWeight: '600', marginBottom: 8, color: Colors.mainDark },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 2 },
  label: { textAlign: 'right', fontSize: 15, color: '#666' },
  value: { textAlign: 'right', fontSize: 15, fontWeight: '500', color: '#222' },
  bold: { fontWeight: 800 },
  pay: { textAlign: 'right', fontSize: 16, fontWeight: '700', color: '#0A6A20' },
});
