import { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { beforeAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import SignInForm from "../components/SignInForm/SignInForm";
import { fetchUsers } from "../store/api/fetchUsers.api";
import { useDispatch } from "react-redux";
import { ErrorMessages } from "../constants/Messages";
import { setError } from "../store/actions";
import { Colors } from "../constants";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const signIn = async (
    userIdentifier: { type: "email" | "passportId"; value: string },
    password: string
  ) => {

    try {
      let emailToLogin = userIdentifier.value;

      if (userIdentifier.type === "passportId") {
        const q = query(
          collection(db, "users"),
          where("passportId", "==", userIdentifier.value)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          dispatch(setError({message: ErrorMessages.FIELDS_REQUIRED}))
          setIsLoading(false);
          return;
        }
      setIsLoading(true);

        const user = snapshot.docs[0].data();
        emailToLogin = user.email;
      }

      // Firebase Email Auth
      await signInWithEmailAndPassword(auth, emailToLogin, password);
    } catch (e) {
      dispatch(setError({message: ErrorMessages.CONNECTION_ERROR}))
    }
    setIsLoading(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.mainDark} style={{alignSelf: 'center'}}/>
      ) : (
        <SignInForm onSubmit={signIn} />
      )}
    </View>
  );
}


