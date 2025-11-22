import { ScrollView, StyleSheet, View } from 'react-native';
import React from 'react';

export default function ScreenLayout({ children }: { children: React.ReactNode }) {

  return (
    <View
      style={styles.container}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
})
