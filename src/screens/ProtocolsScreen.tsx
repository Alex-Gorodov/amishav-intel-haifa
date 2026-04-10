import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import React from 'react'
import PressableCard from '../components/PressableCard/PressableCard'
import { useNavigation } from '@react-navigation/native'
import useRefresh from '../hooks/useRefresh';

export default function ProtocolsScreen() {
  const navigation = useNavigation();
  const refresh = useRefresh();

  return (
    <ScrollView style={styles.grid} refreshControl={<RefreshControl refreshing={false} onRefresh={refresh.onRefresh} />}>
      <PressableCard style={styles.card} title='חירום' onHandle={() => navigation.navigate("EmergencyProtocols" as never)}/>
      <PressableCard style={styles.card} title='ביטחון' onHandle={() => navigation.navigate("SecurityProtocols" as never)}/>
      <PressableCard style={styles.card} title='בקרה' onHandle={() => navigation.navigate("ControllerProtocols" as never)}/>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    padding: 8,
    backgroundColor: 'rgb(242,242,242)',
    flexDirection: 'column',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    minWidth: '100%',
    marginBottom: 12
  }
})
