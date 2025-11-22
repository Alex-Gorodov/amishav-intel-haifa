import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenLayout from '../app/layouts/ScreenLayout'

export default function SalaryScreen() {
  return (
    <ScreenLayout>
      <View style={styles.container}>
        <Text>SalaryScreen</Text>
      </View>
    </ScreenLayout>
  )
}

const styles = StyleSheet.create({
  container: { padding: 8, backgroundColor: 'rgb(242,242,242)' },

})
