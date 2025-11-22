import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import useUser from '../../hooks/useUser';
import { Roles } from '../../constants/Roles';
import { getRoleLabel } from '../../utils/getRoleLabel';
import { Colors, CURRENT_DATE } from '../../constants';
import { getMonthlyHours } from '../../utils/getMonthlyHours';
import Card from '../Card/Card';
import { Tariffs } from '../../constants/Tariffs';

export default function UserOverview() {
  const user = useUser();
  const shifts = user?.shifts.filter((s) => s.date.toDate().getMonth() === CURRENT_DATE.getMonth());
  const hours = getMonthlyHours(user?.shifts ?? []).toFixed(1);

  const salary = (Number(hours) * Tariffs.shift_manager).toLocaleString() || 0;

  return (
    <View style={styles.container}>
      <View style={{padding: 16}}>
        <Text style={styles.name}>{ user ? user.firstName : 'אין חיבור'}</Text>
        {
          user && user.roles.map((role, index) => (
            <Text style={styles.role} key={index}>{getRoleLabel(role)}</Text>
          ))
        }
      </View>
      <View style={{gap: 8}}>
        <Card title={'ש״ח'} content={salary}/>
        <View style={{flexDirection: 'row', gap: 8}}>
          <Card title={'משמרות'} content={shifts?.length || 0} style={{flex: 1}}/>
          <Card title={'שעות'} content={hours || 0} style={{flex: 1}}/>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,

    backgroundColor: '#333',
    borderRadius: 24,
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
    color: '#fff'
  },
  role: {
    fontSize: 16,
    textAlign: 'right',
    color: '#fff'
  }
})
