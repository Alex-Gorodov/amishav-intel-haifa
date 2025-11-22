import { ActivityIndicator, Text } from 'react-native'
import React, { useEffect } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabsList } from '../../constants/TabsList';
import CustomTabBar from './CustomTabBar';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from '../../screens/ProfileScreen';
import { signOut } from "firebase/auth";
import { auth } from '../../services/firebaseConfig';
import useUser from '../../hooks/useUser';
import ScheduleScreen from '../../screens/ScheduleScreen';
import SalaryScreen from '../../screens/SalaryScreen';
import { useDispatch } from 'react-redux';
import { fetchUsers } from '../../store/api/fetch.api';
import AvailabilityScreen from '../../screens/AvailabilityScreen';
import ProtocolsNavigator from '../ProtocolsNavigator/ProtocolsNavigator';
import ProfileStackNavigator from '../ProfileStackNavigator/ProfileStackNavigator';

export default function Navigation() {
  const Tab = createBottomTabNavigator<TabsList>();
  const user = useUser();

  const dispatch = useDispatch();

  useEffect(() => {
    fetchUsers(dispatch);
  }, [dispatch]);


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
                color="black"
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
              <Ionicons name="person-outline" color={color} size={size ?? 24} />
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
                color="black"
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
                color="black"
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
          component={ScheduleScreen}
          options={{
            title: 'סידור',
            tabBarLabel: 'סידור',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" color={color} size={size ?? 24} />
            ),
            headerRight: () => (
              <Ionicons
                name="exit-outline"
                size={24}
                color="black"
                style={{ marginRight: 16 }}
                onPress={async () => {
                  await signOut(auth);
                }}
              />
            ),
          }}
        />

      </Tab.Navigator>
  )
}
