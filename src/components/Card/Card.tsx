import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import React from 'react';

interface CardProps {
  title: string;
  content: string | number;
  style?: StyleProp<ViewStyle>;
}

export default function Card({title, content, style}: CardProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.content}>{content}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  content: {
    fontSize: 32,
    fontWeight: 600,
    color: '#333'
  },
  title: {
    color: '#333'
  },
})
