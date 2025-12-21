import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import React from 'react';
import { Colors } from '../../constants';

interface PressableCardProps {
  title: string;
  content?: string | number;
  onHandle: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function PressableCard({title, content, style, onHandle}: PressableCardProps) {
  return (
    <TouchableOpacity onPress={onHandle} style={[styles.wrapper, style]}>
      {
        content
        &&
        <Text style={styles.content}>{content}</Text>
      }
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    minHeight: 120,
    backgroundColor: Colors.mainLight,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 600,
    color: Colors.mainDark,
    textAlign: 'center',
  },
  content: {
    color: Colors.mainDark,

  },
})
