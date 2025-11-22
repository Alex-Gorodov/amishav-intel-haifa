import { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import SignInForm from "../components/SignInForm/SignInForm";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (
    userIdentifier: { type: "email" | "passportId"; value: string },
    password: string
  ) => {
    setIsLoading(true);
    try {
      let emailToLogin = userIdentifier.value;

      if (userIdentifier.type === "passportId") {
        const q = query(
          collection(db, "users"),
          where("passportId", "==", userIdentifier.value)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          alert("משתמש לא נמצא");
          setIsLoading(false);
          return;
        }

        const user = snapshot.docs[0].data();
        emailToLogin = user.email;
      }

      // Firebase Email Auth
      await signInWithEmailAndPassword(auth, emailToLogin, password);
    } catch (e) {
      console.log("Login error", e);
      alert("שגיאה בהתחברות");
    }
    setIsLoading(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <SignInForm onSubmit={signIn} />
      )}
    </View>
  );
}


