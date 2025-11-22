import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import React, { useCallback } from 'react'
import ScreenLayout from '../app/layouts/ScreenLayout'
import { SimpleToggle } from '../components/CustomToggle/CustomToggle'
import ScheduleListGeneral from '../components/ScheduleList/ScheduleListGeneral'
import ScheduleListPrivate from '../components/ScheduleList/ScheduleListPrivate'
import { useDispatch } from 'react-redux'
import { fetchUsers } from '../store/api/fetch.api'
import * as Haptics from 'expo-haptics';

export default function ScheduleScreen() {
  const [isActive, setIsActive] = React.useState(true);
  const dispatch = useDispatch();

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchUsers(dispatch);
  }, [dispatch]);

  return (
      <ScreenLayout>
        <View style={styles.topButtonsWrapper}>
          <SimpleToggle
            value={isActive}
            onChange={setIsActive}
            leftLabel="אישי"
            rightLabel="כללי"
          />
        </View>



        {
          !isActive
          ?
          <ScrollView style={{height: '75%'}}
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={onRefresh} />
            }
          >
            <ScheduleListPrivate />
          </ScrollView>
          :
            <ScheduleListGeneral />
        }

      </ScreenLayout>
  )
}

const styles = StyleSheet.create({
  topButtonsWrapper: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    zIndex: 10,
  }
})
