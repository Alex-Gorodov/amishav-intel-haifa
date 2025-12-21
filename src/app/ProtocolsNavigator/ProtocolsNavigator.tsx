import ControllerProtocolsScreen from "../../screens/Protocols/ControllerProtocolsScreen";
import HourlyInstructionsScreen from "../../screens/Protocols/HourlyInstructionsScreen";
import EmergencyProtocolsScreen from "../../screens/Protocols/EmergencyProtocolsScreen";
import SecurityProtocolsScreen from "../../screens/Protocols/SecurityProtocolsScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProtocolsScreen from "../../screens/ProtocolsScreen";
import { auth } from '../../services/firebaseConfig';
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants";
import { signOut } from "firebase/auth";

const Stack = createNativeStackNavigator();

export default function ProtocolsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProtocolsMain"
        component={ProtocolsScreen}
        options={{
          title: 'נהלים',
          headerRight: () => (
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
        name="EmergencyProtocols"
        component={EmergencyProtocolsScreen}
        options={{
          title: 'חירום',
          headerTintColor: Colors.mainDark,
          headerRight: () => (
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
        name="SecurityProtocols"
        component={SecurityProtocolsScreen}
        options={{
          title: 'ביטחון',
          headerTintColor: Colors.mainDark,
          headerRight: () => (
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
        name="ControllerProtocols"
        component={ControllerProtocolsScreen}
        options={{
          title: 'בקרה',
          headerTintColor: Colors.mainDark,
          headerRight: () => (
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
        name="HourlyInstructions"
        component={HourlyInstructionsScreen}
        options={{
          title: 'הוראות שעה',
          headerTintColor: Colors.mainDark,
          headerRight: () => (
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
    </Stack.Navigator>
  );
}
