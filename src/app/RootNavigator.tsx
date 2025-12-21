import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Navigation from "./Navigation/Navigation";
import AuthNavigator from "./auth/AuthNavigator";


const RootStack = createNativeStackNavigator();

export default function RootNavigator() {

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={Navigation} />

        <RootStack.Screen name="Auth" component={AuthNavigator} />

      </RootStack.Navigator>
    </NavigationContainer>
  );
}
