import { useShabbatByWeek } from '../../hooks/useShabbatByWeek';
import { getMonthlySalary, getShiftSalary } from '../../utils/getShiftSalary';
import { getMonthlyHours } from '../../utils/getMonthlyHours';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, CURRENT_DATE } from '../../constants';
import useUser from '../../hooks/useUser';
import Card from '../Card/Card';
import { useMemo } from 'react';
import FlipCard from '../FlipCard/FlipCard';
import SalaryCard from '../SalaryCard/SalaryCard';
import { getHoursString } from '../../utils/getHoursString';
import { useImageUpload } from '../../hooks/useImageUpload';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { fetchUsers } from '../../store/api/fetchUsers.api';
import { useDispatch } from 'react-redux';
import { getWeekKeyForShift } from '../../utils/getWeekKeyForShift';
import { setError, setSuccess } from '../../store/actions';
import { ErrorMessages, SuccessMessages } from '../../constants/Messages';
import { getShabbatHoursString } from '../../utils/getShabbatHours';

export default function UserOverview() {
  const user = useUser();
  const dispatch = useDispatch();
  const hours = getMonthlyHours(user?.shifts ?? []).toFixed(2);

  const shifts = useMemo(() => {
    return user?.shifts.filter((s) => s.date.toDate().getMonth() === CURRENT_DATE.getMonth()) ?? [];
  }, [user?.shifts]);

  const shabbatByWeek = useShabbatByWeek(shifts);

  const salary = getMonthlySalary(shifts, shabbatByWeek);


  const userName = user ? user.firstName + ' ' + user.secondName : 'אין חיבור';

  const totalHours = getHoursString(Number(hours));

  const shabbatHours = user && getShabbatHoursString(shifts, shabbatByWeek);

  const { handlePickImage, uploading } = useImageUpload(async (url: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { avatarUrl: url });
      await fetchUsers(dispatch);
      dispatch(setSuccess({message: SuccessMessages.PROFILE_IMAGE_UPDATED}))
    } catch (e) {
      dispatch(setError({message: ErrorMessages.TRY_AGAIN}))
      console.error('❌ Error updating avatar:', e);
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>

        <Pressable onPress={handlePickImage} disabled={uploading}>
          <View style={styles.avatarPlaceholder}>

            {
              uploading
              ?
                <ActivityIndicator size='small' color={Colors.mainDark}/>
                :
                user?.avatarUrl ? (
                  <Image style={styles.avatar} source={{ uri: user.avatarUrl }} />
                ) : (
                  <Text style={styles.avatarPlaceholderText}>
                    {user?.firstName?.charAt(0)}
                  </Text>
                )
              }
          </View>
        </Pressable>

        <Text style={styles.name}>{userName}</Text>

      </View>
      <View style={{gap: 8}}>

        <SalaryCard salary={salary} />
        <View style={{flexDirection: 'row', gap: 8}}>
          <Card title={'משמרות'} content={shifts?.length || 0} style={{flex: 1}}/>
          <FlipCard front={
            <Card title={'ס״כ שעות'} content={totalHours || 0} style={{flex: 1}}/>
          } back={
            <Card title={'שעות שבת'} content={shabbatHours || 0} style={{flex: 1}}/>
          }/>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingTop: 24,
    backgroundColor: Colors.mainDark,
    borderRadius: 24,
    gap: 8,
  },
  profileHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16
  },
  avatarPlaceholder: {
    borderRadius: 50,
    width: 60,
    height: 60,
    backgroundColor: Colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 60,
    height: 60
  },
  avatarPlaceholderText: {
    color: Colors.white,
    fontSize: 32,
  },
  name: {
    fontSize: 18,
    fontWeight: 600,
    textAlign: 'right',
    color: Colors.mainLight
  },
  role: {
    fontSize: 16,
    textAlign: 'right',
    color: Colors.mainLight
  },
  text: {
    fontSize: 32,
    fontWeight: 600,
    color: Colors.mainDark
  }
})
