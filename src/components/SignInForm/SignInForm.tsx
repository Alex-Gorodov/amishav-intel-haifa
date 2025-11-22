// import { useNavigation } from "@react-navigation/native";
// import React, { use, useState } from "react";
// import { View, TextInput, Button, StyleSheet, Text } from "react-native";

// type SignInFormProps = {
//   onSubmit: (id: string, password: string) => void;
// };

// export default function SignInForm({ onSubmit }: SignInFormProps) {
//   const [id, setId] = useState("");
//   const [password, setPassword] = useState("");
//   const navigation = useNavigation();

//   const handleLogin = () => {
//     if (password.length !== 6) {
//       return alert("הסיסמה חייבת להכיל 6 ספרות");
//     }
//     onSubmit(id, password);
//   };

//   return (
//     <View style={styles.container}>

//       <Text style={styles.label}>תעודת זהות / אימייל</Text>
//       <TextInput
//         placeholder="הכנס מספר ת.ז או אימייל"
//         style={styles.input}
//         value={id}
//         onChangeText={setId}
//       />

//       <Text style={styles.label}>סיסמה (6 ספרות)</Text>
//       <TextInput
//         placeholder="******"
//         style={styles.input}
//         secureTextEntry
//         keyboardType="numeric"
//         maxLength={6}
//         value={password}
//         onChangeText={setPassword}
//       />

//       <Button title="כניסה" onPress={handleLogin} />
//       <Button
//         title="חזרה"
//         onPress={() => navigation.navigate("Onboarding" as never)}
//       />

//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 24,
//     gap: 14,
//     marginTop: 80,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "600",
//     textAlign: "right",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#aaa",
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     textAlign: "right",
//   },
// });


import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";

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

  const handleLogin = () => {
    if (password.length !== 6) {
      return alert("הסיסמה חייבת להכיל 6 ספרות");
    }

    const isEmail = passportId.includes("@");

    onSubmit(
      { type: isEmail ? "email" : "passportId", value: passportId.trim() },
      password
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>תעודת זהות / אימייל</Text>
      <TextInput
        placeholder="הכנס מספר ת.ז או אימייל"
        style={styles.input}
        value={passportId}
        onChangeText={setPassportId}
      />

      <Text style={styles.label}>סיסמה (6 ספרות)</Text>
      <TextInput
        placeholder="******"
        style={styles.input}
        secureTextEntry
        keyboardType="numeric"
        maxLength={6}
        value={password}
        onChangeText={setPassword}
      />

      <Button title="כניסה" onPress={handleLogin} />
      <Button
        title="חזרה"
        onPress={() => navigation.navigate("Onboarding" as never)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 14,
    marginTop: 80,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "right",
  },
});
