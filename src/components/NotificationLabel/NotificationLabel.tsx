import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

interface NotificationLabelProps {
  num?: number;
  position: number[];
}

export default function NotificationLabel({ num, position }: NotificationLabelProps) {
  if (!num || num <= 0) return null;

  return (
    <View style={[styles.notificationLabel, { right: position[0], top: position[1] }]}>
      <Text style={[styles.text, { fontSize: num ?? 16 }]}>
        {num && num > 0 ? num : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notificationLabel: {
    width: 12,
    height: 12,
    borderRadius: 50,
    backgroundColor: '#ff2b3cff',
    position: "absolute",
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontWeight: 600,
  },
})
