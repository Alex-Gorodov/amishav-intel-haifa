import React, { useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable
} from "react-native";
import { auth, db } from "../../services/firebaseConfig"; // web Firebase config
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Roles } from "../../constants/Roles";
import CustomButton from "../CustomButton/CustomButton";
import { Colors } from "../../constants";
import CancelButton from "../CancelButton/CancelButton";
import { ErrorMessages } from "../../constants/Messages";

interface NewEmployeeFormProps {
  isOpened: boolean;
  onClose: () => void;
}

export default function NewEmployeeForm({ isOpened, onClose }: NewEmployeeFormProps) {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [passport, setPassport] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [focusFirstName, setFocusFirstName] = useState(false);
  const [focusSecondName, setFocusSecondName] = useState(false);
  const [focusPassport, setFocusPassport] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPhone, setFocusPhone] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);

  const firstNameRef = useRef<TextInput | null>(null);
  const secondNameRef = useRef<TextInput | null>(null);
  const idNumberRef = useRef<TextInput | null>(null);
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const phoneRef = useRef<TextInput | null>(null);

  const toggleRole = (value: string) => {
    setSelectedRoles((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    );
  };

  const resetForm = () => {
    setPassport("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setSecondName("");
    setPhone("");
    setSelectedRoles([]);
  }

  const handleCreateUser = async () => {

    setError(null);

    if (!email || !password || !firstName || !secondName) {
      setError(ErrorMessages.FIELDS_REQUIRED);
      return;
    }

    if (selectedRoles.length === 0) {
      setError(ErrorMessages.ROLE_REQUIRED);
      return;
    }

    try {
      setLoading(true);

      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      await setDoc(doc(db, "users", uid), {
        id: uid,
        passportId: passport,
        firstName,
        secondName,
        email,
        roles: selectedRoles,
        shifts: [],
        isAdmin: false,
        phoneNumber: phone,
        avatarUrl: null,
        createdAt: serverTimestamp(),
      });

      setLoading(false);
      onClose();
      resetForm();

    } catch (err: any) {
      setLoading(false);
      setError(err.message || ErrorMessages.USER_CREATE_ERROR);
    }
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal transparent visible={isOpened}  animationType="fade">
      <Pressable style={styles.overlay} onPress={closeModal}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View>
            <Text style={styles.title}>עובד חדש</Text>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={{gap: 8}}>
                <TextInput onFocus={() => setFocusFirstName(true)} onBlur={() => setFocusFirstName(false)} ref={firstNameRef} onSubmitEditing={() => secondNameRef.current?.focus()} returnKeyType="next" placeholderTextColor={Colors.placeholder} placeholder="שם פרטי" style={[styles.input, {borderColor: focusFirstName ? Colors.mainDark :Colors.mainLight}]} value={firstName} onChangeText={setFirstName} />
                <TextInput onFocus={() => setFocusSecondName(true)} onBlur={() => setFocusSecondName(false)} ref={secondNameRef} onSubmitEditing={() => idNumberRef.current?.focus()} returnKeyType="next" placeholderTextColor={Colors.placeholder} placeholder="שם משפחה" style={[styles.input, {borderColor: focusSecondName ? Colors.mainDark :Colors.mainLight}]} value={secondName} onChangeText={setSecondName} />
                <TextInput onFocus={() => setFocusPassport(true)} onBlur={() => setFocusPassport(false)} ref={idNumberRef} onSubmitEditing={() => emailRef.current?.focus()} returnKeyType="next" placeholderTextColor={Colors.placeholder} placeholder="תעודת זהות" style={[styles.input, {borderColor: focusPassport ? Colors.mainDark :Colors.mainLight}]} value={passport} onChangeText={setPassport} />
                <TextInput onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)} ref={emailRef} onSubmitEditing={() => phoneRef.current?.focus()} returnKeyType="next" placeholderTextColor={Colors.placeholder} placeholder="אימייל" style={[styles.input, {borderColor: focusEmail ? Colors.mainDark :Colors.mainLight}]} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
                <TextInput onFocus={() => setFocusPhone(true)} onBlur={() => setFocusPhone(false)} ref={phoneRef} onSubmitEditing={() => passwordRef.current?.focus()} returnKeyType="next" placeholderTextColor={Colors.placeholder} placeholder="מס' טלפון" style={[styles.input, {borderColor: focusPhone ? Colors.mainDark :Colors.mainLight}]} value={phone} onChangeText={setPhone} keyboardType="phone-pad"/>
                <TextInput onFocus={() => setFocusPassword(true)} onBlur={() => setFocusPassword(false)} ref={passwordRef} onSubmitEditing={() => {passwordRef.current?.blur(); Keyboard.dismiss();}} returnKeyType="done" placeholderTextColor={Colors.placeholder} placeholder="סיסמה (מס' עובד)" style={[styles.input, {borderColor: focusPassword ? Colors.mainDark :Colors.mainLight}]} value={password} secureTextEntry onChangeText={setPassword} />
              </View>
            </TouchableWithoutFeedback>

            <Text style={styles.label}>בחר תפקידים:</Text>
            <ScrollView style={[styles.rolesListWrapper, {maxHeight: 160, marginBottom: 16}]}>
              {Roles.map((role) => (
                <TouchableOpacity
                key={role.value}
                onPress={() => toggleRole(role.value)}
                style={[
                  styles.roleItem,
                  selectedRoles.includes(role.value) && styles.roleItemSelected,
                ]}
                >
                  <Text style={{textAlign: 'right'}}>{role.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <CustomButton
              onHandle={handleCreateUser}
              // invertColors
              title={
                loading ? <ActivityIndicator size="small" /> : <Text>אשר עובד חדש</Text>
              }
            />
            <CancelButton onHandle={onClose}/>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 8 },
  container: { backgroundColor: "#fff", borderRadius: 24, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 16, textAlign: 'center' },
  error: { color: "red", marginBottom: 10 },
  input: { borderWidth: 2, padding: 10, borderRadius: 16, textAlign: 'right' },
  label: { fontWeight: "600", marginVertical: 8, textAlign: 'right', paddingRight: 8 },
  rolesListWrapper: {
    maxHeight: 200,
    borderWidth: 1,
    padding: 8,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: 'inset 0px -4px 10px 0px rgba(0,0,0,0.4)'
  },
  roleItem: { padding: 10, borderRadius: 16, borderWidth: 2, borderColor: Colors.mainLight, marginBottom: 5 },
  roleItemSelected: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  addButton: { marginTop: 20, backgroundColor: "#2b7cff", padding: 15, borderRadius: 6 },
  addButtonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  cancelButton: { padding: 12 },
  cancelButtonText: { textAlign: "center", color: Colors.errorText, fontWeight: 600, fontSize: 16 },
});
