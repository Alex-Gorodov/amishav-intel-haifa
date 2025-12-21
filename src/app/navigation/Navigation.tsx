import { fetchSwapRequests, fetchGiveRequests } from '../../store/api/fetchRequests.api';
import NotificationLabel from '../../components/NotificationLabel/NotificationLabel';
import ProfileStackNavigator from '../ProfileNavigator/ProfileNavigator';
import ProtocolsNavigator from '../ProtocolsNavigator/ProtocolsNavigator';
import { getRequestsWithShifts } from '../../utils/getRequestsWithShifts';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AvailabilityScreen from '../../screens/AvailabilityScreen';
import { ActivityIndicator, Text, View } from 'react-native';
import { fetchUsers } from '../../store/api/fetchUsers.api';
import ScheduleScreen from '../../screens/ScheduleScreen';
import { useDispatch, useSelector } from 'react-redux';
import SalaryScreen from '../../screens/SalaryScreen';
import { RootState } from '../../store/root-reducer';
import { auth } from '../../services/firebaseConfig';
import { TabsList } from '../../constants/TabsList';
import React, { useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import useUser from '../../hooks/useUser';
import { signOut } from "firebase/auth";
import { Colors } from '../../constants';
import ScheduleStackNavigator from '../ScheduleNavigator/ScheduleNavigator';
import CustomTabBar from '../../components/CustomTabBar/CustomTabBar';


export default function Navigation() {
  const Tab = createBottomTabNavigator<TabsList>();
  const user = useUser();
  const requestsCount = useSelector((state: RootState) => state.data.giveRequests.length + state.data.swapRequests.length);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchUsers(dispatch);
    fetchSwapRequests(dispatch);
    fetchGiveRequests(dispatch);
  }, [dispatch]);


    const allGiveRequests = useSelector((state: RootState) => state.data.giveRequests)
    const allSwapRequests = useSelector((state: RootState) => state.data.swapRequests)
    const users = useSelector((state: RootState) => state.data.users);

    const allRequests = useMemo(() => {
      return getRequestsWithShifts(
        [...allGiveRequests, ...allSwapRequests],
        users
      );
    }, [allGiveRequests, allSwapRequests, users]);

    const receivedRequests = user
        ? allRequests.filter(req => req.secondUserId === user.id)
        : [];


  return (
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: true }}

      >
        <Tab.Screen
          name="Profile"
          component={ProfileStackNavigator}
          options={{
            headerShown: false,
            headerRight: () => (
              <Ionicons
                name="exit-outline"
                size={24}
                color={Colors.mainDark}
                style={{ marginRight: 16 }}
                onPress={async () => {
                  await signOut(auth);
                }}
              />
            ),
            headerTitle: () =>
              user ? (
                <Text style={{fontWeight: 600, fontSize: 16}}>{user.firstName}</Text>
              ) : (
                <ActivityIndicator size="small" />
              ),
            tabBarIcon: ({ color, size }) => (
              <View>
                <Ionicons name="person-outline" color={color} size={size ?? 24}>
                </Ionicons>
                {
                  (receivedRequests.length > 0 || (user?.isAdmin && requestsCount > 0)) &&
                  <NotificationLabel num={requestsCount} position={[-6, -6]}/>
                }

              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Protocols"
          component={ProtocolsNavigator}
          options={{
            title: 'נהלים',
            tabBarLabel: 'נהלים',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-outline" color={color} size={size ?? 24} />
            ),
            headerShown: false,
          }}
        />

        <Tab.Screen
          name="Salary"
          component={SalaryScreen}
          options={{
            title: 'שכר',
            tabBarLabel: 'שכר',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cash-outline" color={color} size={size ?? 24} />
            ),
            headerRight: () => (
              <Ionicons
                name="exit-outline"
                size={24}
                color={Colors.mainDark}
                style={{ marginRight: 16 }}
                onPress={async () => {
                  await signOut(auth);
                }}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Availability"
          component={AvailabilityScreen}
          options={{
            title: 'זמינות',
            tabBarLabel: 'זמינות',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="alarm-outline" color={color} size={size ?? 24} />
            ),
            headerRight: () => (
              <Ionicons
                name="exit-outline"
                size={24}
                color={Colors.mainDark}
                style={{ marginRight: 16 }}
                onPress={async () => {
                  await signOut(auth);
                }}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Schedule"
          component={ScheduleStackNavigator}
          options={({ navigation }) => ({
            title: 'סידור',
            headerShown: false,
            tabBarLabel: 'סידור',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" color={color} size={size ?? 24} />
            ),
            headerRight: () => (
              <Ionicons
                name="exit-outline"
                size={24}
                color={Colors.mainDark}
                style={{ marginRight: 16 }}
                onPress={async () => {
                  await signOut(auth);
                }}
              />
            ),
            headerLeft: () => (
              <Ionicons
                name="calendar-outline"
                size={24}
                color={Colors.mainDark}
                style={{ marginLeft: 16 }}
                onPress={() =>
                  navigation.navigate('Schedule', {
                    screen: 'UserMonthCalendar',
                  } as never)
                }
              />
            ),
          })}
        />

      </Tab.Navigator>
  )
}
