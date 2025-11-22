import NewEmployeeForm from '../components/NewEmployeeForm/NewEmployeeForm';
import AddShiftModal from '../components/AddShiftModal/AddShiftModal';
import UserOverview from '../components/UserOverview/UserOverview';
import CustomButton from '../components/CustomButton/CustomButton';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../app/layouts/ScreenLayout';
import { StyleSheet, View } from 'react-native';
import useUser from '../hooks/useUser';
import { useState } from 'react';

export default function ProfileScreen() {
  const [isAddModalOpened, setIsAddModalOpened] = useState(false);
  const user = useUser();
  const navigation = useNavigation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <UserOverview/>
        {
          user && user.isAdmin &&
            <>
              <CustomButton title="הוספת עובד חדש" onHandle={() => setIsModalOpen(true)}/>
              <NewEmployeeForm
                isOpened={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              />
            </>

        }

        {user && (
          <AddShiftModal
            isOpened={isAddModalOpened}
            onClose={() => setIsAddModalOpened(false)}
            userId={user.id}
          />
        )}

        <CustomButton title="מסמכים" onHandle={() => navigation.navigate('Documents' as never)} />

      </View>
    </ScreenLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
})
