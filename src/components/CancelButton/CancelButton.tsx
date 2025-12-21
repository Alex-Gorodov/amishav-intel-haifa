import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Colors } from '../../constants';

interface CancelButtonProps {
  onHandle: () => void;
}

export default function CancelButton({onHandle}: CancelButtonProps) {
  return (
    <TouchableOpacity style={styles.cancelButton} onPress={onHandle}>
      <Text style={styles.cancelButtonText}>ביטול</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  cancelButton: { padding: 12 },
  cancelButtonText: { textAlign: "center", color: Colors.errorText, fontWeight: 600, fontSize: 16 },
})
