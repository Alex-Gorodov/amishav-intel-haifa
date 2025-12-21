import NewEmployeeForm from '../components/NewEmployeeForm/NewEmployeeForm';
import AddShiftModal from '../components/AddShiftModal/AddShiftModal';
import UserOverview from '../components/UserOverview/UserOverview';
import CustomButton from '../components/CustomButton/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import useUser from '../hooks/useUser';
import { useMemo, useState } from 'react';
import useRefresh from '../hooks/useRefresh';

export default function ProfileScreen() {
  const [isAddShiftModalOpened, setIsAddShiftModalOpened] = useState(false);
  const user = useUser();
  const navigation = useNavigation();
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);
  const refresh = useRefresh();

  return (

    <ScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refresh.onRefresh}/>
      }
    >
      <View style={styles.container}>
        <UserOverview/>

        <CustomButton title="מסמכים ותעודות" onHandle={() => navigation.navigate('Documents' as never)} />
        <CustomButton title="הדרכות ורענונים" onHandle={() => navigation.navigate('Trainings' as never)} />
        <CustomButton title="החלפות" onHandle={() => navigation.navigate('UserSwapAndGive' as never)} />
        <CustomButton title="הוסף משמרת" onHandle={() => setIsAddShiftModalOpened(true)}/>

        {
          user && user.isAdmin &&
            <>
              <Text style={{textAlign: 'center', fontSize: 20, fontWeight: 600}}>אזור ראש הצוות</Text>
              <CustomButton title="הוספת עובד חדש" onHandle={() => setIsNewEmployeeModalOpen(true)}/>
              <CustomButton title="בניית סידור" onHandle={() => navigation.navigate('ScheduleCreating' as never)}/>
              <CustomButton title="החלפות/מסירות" onHandle={() => navigation.navigate('AdminSwapsAndGives' as never)}/>
              <NewEmployeeForm
                isOpened={isNewEmployeeModalOpen}
                onClose={() => setIsNewEmployeeModalOpen(false)}
              />
            </>

        }

        {user && (
          <AddShiftModal
            isOpened={isAddShiftModalOpened}
            onClose={() => setIsAddShiftModalOpened(false)}
            userId={user.id}
          />
        )}

      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingBottom: 100,
    gap: 8,
  },
})
