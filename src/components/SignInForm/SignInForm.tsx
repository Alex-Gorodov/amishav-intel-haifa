import { useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Pressable, TouchableOpacity, Alert, Keyboard } from "react-native";
import CustomButton from "../CustomButton/CustomButton";
import { Colors } from "../../constants";
import { handleResetPassword } from "../../services/firebaseResetPassword";
import { useDispatch } from "react-redux";
import { setError } from "../../store/actions";
import { ErrorMessages } from "../../constants/Messages";

type SignInFormProps = {
  onSubmit: (
    userIdentifier: { type: "email" | "passportId"; value: string },
    password: string
  ) => void;
};

export default function SignInForm({ onSubmit }: SignInFormProps) {
  const [passportId, setPassportId] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [isIdFocused, setIdFocused] = useState(false);
  const [isPasswordFocused, setPasswordFocused] = useState(false);

  const passwordRef = useRef<TextInput | null>(null);

  const isEmail = passportId.includes("@");

  const handleLogin = () => {
    if (password.length !== 6) {
      dispatch(setError({message: ErrorMessages.PASSWORD_MIN_LENGTH_ERROR}))
    }

    onSubmit(
      { type: isEmail ? "email" : "passportId", value: passportId.trim() },
      password
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>תעודת זהות / אימייל</Text>
      <TextInput
        onFocus={() => setIdFocused(true)}
        onBlur={() => setIdFocused(false)}
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="הכנס מספר ת.ז או אימייל"
        placeholderTextColor={Colors.placeholder}
        style={[styles.input, {borderColor: isIdFocused ? Colors.mainDark : "#aaa"}]}
        returnKeyType="next"
        keyboardType="email-address"
        value={passportId}
        onChangeText={setPassportId}
      />

      <Text style={styles.label}>סיסמה (6 ספרות)</Text>
      <TextInput
        ref={passwordRef}
        onFocus={() => setPasswordFocused(true)}
        onBlur={() => setPasswordFocused(false)}
        onSubmitEditing={() => {passwordRef.current?.blur(); Keyboard.dismiss();}}
        returnKeyType="done"
        placeholder="******"
        placeholderTextColor={Colors.placeholder}
        style={[styles.input, {borderColor: isPasswordFocused ? Colors.mainDark : "#aaa"}]}
        secureTextEntry
        keyboardType="numeric"
        maxLength={6}
        value={password}
        onChangeText={setPassword}
      />

      <CustomButton title="כניסה" onHandle={handleLogin} invertColors/>
      <CustomButton
        title="חזרה"
        onHandle={() => navigation.navigate("Onboarding" as never)}
      />

      <TouchableOpacity
        onPress={() => {
          if (!passportId.includes("@")) {
            dispatch(setError({message: ErrorMessages.ENTER_VALID_EMAIL}));
          }
          handleResetPassword(passportId.trim());
        }}
      >
        <Text style={{
          textAlign: 'center',
          color: Colors.mainDark,
          fontWeight: '600'
        }}>
          שכחת סיסמה?
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  input: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "right",
  },
});
