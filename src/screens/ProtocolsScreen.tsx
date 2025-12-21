import { StyleSheet, View } from 'react-native'
import React from 'react'
import PressableCard from '../components/PressableCard/PressableCard'
import { useNavigation } from '@react-navigation/native'

export default function ProtocolsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.grid}>
      <PressableCard title='חירום' onHandle={() => navigation.navigate("EmergencyProtocols" as never)}/>
      <PressableCard title='ביטחון' onHandle={() => navigation.navigate("SecurityProtocols" as never)}/>
      <PressableCard title='בקרה' onHandle={() => navigation.navigate("ControllerProtocols" as never)}/>
      {/* <PressableCard title='הוראות שעה' onHandle={() => navigation.navigate("HourlyInstructions" as never)}/> */}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    padding: 8,
    backgroundColor: 'rgb(242,242,242)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between'
  },
})
