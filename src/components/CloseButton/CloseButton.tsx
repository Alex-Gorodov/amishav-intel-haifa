import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Colors } from '../../constants';

interface CloseButtonProps {
  onHandle: () => void;
}

export default function CloseButton({onHandle}: CloseButtonProps) {
  return (
    <TouchableOpacity style={styles.closeButton} onPress={onHandle}>
      <Text style={styles.closeButtonText}>סגור</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  closeButton: { padding: 12 },
  closeButtonText: { textAlign: "center", color: Colors.mainDark, fontWeight: 600, fontSize: 16 },
})
