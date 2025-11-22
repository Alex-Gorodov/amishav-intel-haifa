import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import React, { ReactNode } from 'react';
import { Colors } from '../../constants';

interface CustomButtonProps {
  title: string | ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  invertColors?: boolean;
  onHandle: () => void;
}

export default function CustomButton({ title, style, disabled, invertColors, onHandle }: CustomButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && { opacity: 0.2 }, {backgroundColor: invertColors ? Colors.black : '#eee'}]}
      onPress={onHandle}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={[styles.text, {color: invertColors ? '#eee' : Colors.black}]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',

  },
});
