import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { ActivityIndicator } from "react-native";
import { auth } from "./src/services/firebaseConfig";
import AuthNavigator from "./src/app/auth/AuthNavigator";
import Navigation from "./src/app/navigation/Navigation";
import { Provider } from "react-redux";
import { store } from "./src/store";
import RootNavigator from "./src/app/RootNavigator";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  if (isLoading) return <ActivityIndicator size="large" />;

  return (
    <Provider store={store}>
      {user ? <RootNavigator /> : <AuthNavigator />}
    </Provider>
  )
}
