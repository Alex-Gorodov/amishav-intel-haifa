import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React from 'react';
import useUser from '../../hooks/useUser';
import PrivateShiftCard from '../PrivateShiftCard/PrivateShiftCard';
import { useSelector } from 'react-redux';
import { State } from '../../types/State';

export default function ScheduleListPrivate() {
  const user = useUser();
  const isUsersLoading = useSelector((state: State) => state.data.isUsersLoading);

  return (
    <View style={styles.container}>
      {isUsersLoading ? (
        <ActivityIndicator size="small" style={{ marginTop: 30 }} />
      ) : user?.shifts?.length ? (
        user.shifts.map((s) => (
          <PrivateShiftCard key={s.date.toMillis()} shift={s} />
        ))
      ) : (
        <Text style={{ textAlign: "center", marginTop: 30 }}>
          אין עדיין משמרות 🤷‍♂️
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 8, minHeight: '85%', backgroundColor: 'rgb(242,242,242)' },
});
