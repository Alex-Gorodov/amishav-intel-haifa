import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import CustomButton from '../CustomButton/CustomButton';

interface ProtocolItemButtonProps {
  title: string;
  onHandle: () => void;
}

export default function ProtocolItemButton({title, onHandle}: ProtocolItemButtonProps) {
  return (
    <CustomButton style={styles.button} title={title} onHandle={onHandle}/>
  )
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 8
  }
})
