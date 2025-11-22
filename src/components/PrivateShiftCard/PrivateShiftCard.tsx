import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Shift } from '../../types/Shift';
import { getShiftDuration } from '../../utils/getShiftDuration';

interface PrivateShiftCardProps {
  shift: Shift;
}

export default function PrivateShiftCard({ shift }: PrivateShiftCardProps) {
  const date = shift.date.toDate();
  const formattedDate = date.toLocaleDateString("he-IL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.title}>{shift.post.title}</Text>
        {(
          <Text style={styles.time}>
            {shift.startTime} - {shift.endTime}
          </Text>
        )}
      </View>

      <Text style={styles.date}>{formattedDate}</Text>

      <Text>
        {
          getShiftDuration(shift)
        }
      </Text>

      {shift.remark ? (
        <Text style={styles.remark}>📌 {shift.remark}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 20,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  time: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
  date: {
    marginTop: 4,
    fontSize: 13,
    color: "#666",
  },
  remark: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'right',
    color: "#444",
    backgroundColor: "#f3f3f3",
    padding: 6,
    borderRadius: 6,
  },
});
