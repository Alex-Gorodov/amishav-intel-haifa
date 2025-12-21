import AdminSwapsAndGivesScreen from '../../screens/AdminSwapsAndGivesScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScheduleCreatingScreen from '../../screens/ScheduleCreatingScreen';
import UserSwapAndGiveScreen from '../../screens/UserSwapAndGiveScreen';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import TrainingsScreen from '../../screens/TrainingsScreen';
import DocumentsScreen from '../../screens/DocumentsScreen';
import { useFileUpload } from '../../hooks/useFileUpload';
import { auth, db } from '../../services/firebaseConfig';
import ProfileScreen from '../../screens/ProfileScreen';
import { ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useUser from '../../hooks/useUser';
import { signOut } from 'firebase/auth';
import { Colors } from '../../constants';
import UserMonthCalendarScreen from '../../screens/UserMonthCalendarScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
  const user = useUser();

  const { handlePickFileOrImage, uploading } = useFileUpload(async ({url, name}) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, { documents: arrayUnion({ url, name }) });
  });

  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          title: user ? user.firstName : 'בית',

          headerRight: () => (
            <Ionicons
              name="exit-outline"
              size={24}
              color={Colors.mainDark}
              onPress={async () => await signOut(auth)}
            />
          ),
        }}
      />

      <Stack.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          title: 'מסמכים',
          headerBackVisible: true,
          headerTintColor: Colors.mainDark,
          headerRight: () => (
            uploading
            ?
            <ActivityIndicator size="small" color={Colors.mainDark}/>
            :
            <Ionicons
              name="add-outline"
              size={24}
              color={Colors.mainDark}
              onPress={handlePickFileOrImage}
            />
          ),
        }}
      />

      <Stack.Screen
        name="Trainings"
        component={TrainingsScreen}
        options={{
          title: 'הדרכות',
          headerBackVisible: true,
          headerTintColor: Colors.mainDark,
          headerRight: () => (
            uploading
            ?
            <ActivityIndicator size="small" color={Colors.mainDark}/>
            :
            <Ionicons
              name="exit-outline"
              size={24}
              color={Colors.mainDark}
              onPress={async () => {
                await signOut(auth);
              }}
            />
          ),
        }}
      />

      <Stack.Screen
        name="UserSwapAndGive"
        component={UserSwapAndGiveScreen}
        options={{
          title: 'החלפות',
          headerBackVisible: true,
          headerTintColor: Colors.mainDark,
          headerRight: () => (
            uploading
            ?
            <ActivityIndicator size="small" color={Colors.mainDark}/>
            :
            <Ionicons
              name="exit-outline"
              size={24}
              color={Colors.mainDark}
              onPress={async () => {
                await signOut(auth);
              }}
            />
          ),
        }}
      />

      <Stack.Screen
        name="UserMonthCalendar"
        component={UserMonthCalendarScreen}
        options={{
          title: 'החלפות',
          headerBackVisible: true,
          headerTintColor: Colors.mainDark,
          headerRight: () => (
            uploading
            ?
            <ActivityIndicator size="small" color={Colors.mainDark}/>
            :
            <Ionicons
              name="exit-outline"
              size={24}
              color={Colors.mainDark}
              onPress={async () => {
                await signOut(auth);
              }}
            />
          ),
        }}
      />

      {
        user?.isAdmin
        &&
        <Stack.Screen
          name="ScheduleCreating"
          component={ScheduleCreatingScreen}
          options={{
            title: 'בניית סידור',
            headerBackVisible: true,
            headerTintColor: Colors.mainDark,
            headerRight: () => (
              uploading
              ?
              <ActivityIndicator size="small" color={Colors.mainDark}/>
              :
              <Ionicons
                name="exit-outline"
                size={24}
                color={Colors.mainDark}
                onPress={async () => {
                  await signOut(auth);
                }}
              />
            ),
          }}
        />
      }

      {
        user?.isAdmin
        &&
        <Stack.Screen
          name="AdminSwapsAndGives"
          component={AdminSwapsAndGivesScreen}
          options={{
            title: 'החלפות',
            headerBackVisible: true,
            headerTintColor: Colors.mainDark,
            headerRight: () => (
              uploading
              ?
              <ActivityIndicator size="small" color={Colors.mainDark}/>
              :
              <Ionicons
                name="exit-outline"
                size={24}
                color={Colors.mainDark}
                onPress={async () => {
                  await signOut(auth);
                }}
              />
            ),
          }}
        />
      }
    </Stack.Navigator>
  );
}
