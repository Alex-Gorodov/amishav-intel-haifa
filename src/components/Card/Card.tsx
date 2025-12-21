import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import React, { ReactElement } from 'react';
import { Colors } from '../../constants';

interface CardProps {
  title: string | ReactElement;
  titleStyle?: StyleProp<TextStyle>;
  content: string | number | ReactElement;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<TextStyle>;
}

export default function Card({title, titleStyle, content, style, contentStyle}: CardProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <Text style={[styles.content, contentStyle]}>{content}</Text>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    gap: 6,
    borderRadius: 16,
    backgroundColor: Colors.mainLight,
  },
  content: {
    alignSelf: 'center',
    fontSize: 32,
    fontWeight: 600,
    color: Colors.mainDark
  },
  title: {
    color: Colors.mainDark
  },
})
