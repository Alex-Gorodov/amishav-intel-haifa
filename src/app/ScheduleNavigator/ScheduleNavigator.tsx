import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScheduleScreen from "../../screens/ScheduleScreen";
import UserMonthCalendarScreen from "../../screens/UserMonthCalendarScreen";
import { Colors } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";

const Stack = createNativeStackNavigator();

export default function ScheduleNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ScheduleMain"
        component={ScheduleScreen}
        options={({ navigation }) => ({
          title: 'סידור',
          headerRight: () => (
            <Ionicons
              name="exit-outline"
              size={24}
              color={Colors.mainDark}
              onPress={async () => await signOut(auth)}
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

      <Stack.Screen
        name="UserMonthCalendar"
        component={UserMonthCalendarScreen}
        options={{
          title: 'לוח חודשי',
          headerBackVisible: true,
          headerTintColor: Colors.mainDark,
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
    </Stack.Navigator>
  );
}
