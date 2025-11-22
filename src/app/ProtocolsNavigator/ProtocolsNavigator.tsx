import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EmergencyProtocolsScreen from "../../screens/Protocols/EmergencyProtocolsScreen";
import SecurityProtocolsScreen from "../../screens/Protocols/SecurityProtocolsScreen";
import ProtocolsScreen from "../../screens/ProtocolsScreen";
import { Colors } from "../../constants";
import ControllerProtocolsScreen from "../../screens/Protocols/ControllerProtocolsScreen";
import { signOut } from "firebase/auth";
import { auth } from '../../services/firebaseConfig';
import { Ionicons } from "@expo/vector-icons";
import HourlyInstructionsScreen from "../../screens/Protocols/HourlyInstructionsScreen";

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
              color="black"
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
          headerTintColor: Colors.black,
          headerRight: () => (
            <Ionicons
              name="exit-outline"
              size={24}
              color="black"
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
          headerTintColor: Colors.black,
          headerRight: () => (
            <Ionicons
              name="exit-outline"
              size={24}
              color="black"
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
          headerTintColor: Colors.black,
          headerRight: () => (
            <Ionicons
              name="exit-outline"
              size={24}
              color="black"
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
          headerTintColor: Colors.black,
          headerRight: () => (
            <Ionicons
              name="exit-outline"
              size={24}
              color="black"
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
