import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { auth, db } from "../../services/firebaseConfig"; // web Firebase config
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Roles } from "../../constants/Roles";

interface NewEmployeeFormProps {
  isOpened: boolean;
  onClose: () => void;
}

export default function NewEmployeeForm({ isOpened, onClose }: NewEmployeeFormProps) {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [passport, setPassprot] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRole = (value: string) => {
    setSelectedRoles((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    );
  };

  const handleCreateUser = async () => {
    setError(null);

    if (!email || !password || !firstName || !secondName) {
      setError("כל השדות חייבים להיות מלאים");
      return;
    }

    if (selectedRoles.length === 0) {
      setError("בחר לפחות תפקיד אחד");
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
        avatarUrl: null,
        createdAt: serverTimestamp(),
      });

      setLoading(false);
      onClose();

      setPassprot("");
      setEmail("");
      setPassword("");
      setFirstName("");
      setSecondName("");
      setSelectedRoles([]);

    } catch (err: any) {
      setLoading(false);
      setError(err.message || "אירועה שגיאה ביצירת המשתמש");
    }
  };

  return (
    <Modal transparent animationType="slide" visible={isOpened}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView>
            <Text style={styles.title}>עובד חדש</Text>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <TextInput placeholder="שם פרטי" style={styles.input} value={firstName} onChangeText={setFirstName} />
            <TextInput placeholder="שם משפחה" style={styles.input} value={secondName} onChangeText={setSecondName} />
            <TextInput placeholder="תעודת זהות" style={styles.input} value={passport} onChangeText={setPassprot} />
            <TextInput placeholder="אימייל" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput placeholder="סיסמה (מס' עובד)" style={styles.input} value={password} secureTextEntry onChangeText={setPassword} />

            <Text style={styles.label}>תפקידים:</Text>
            {Roles.map((role) => (
              <TouchableOpacity
                key={role.value}
                onPress={() => toggleRole(role.value)}
                style={[
                  styles.roleItem,
                  selectedRoles.includes(role.value) && styles.roleItemSelected,
                ]}
              >
                <Text>{role.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={handleCreateUser} disabled={loading}>
              {loading ? <ActivityIndicator size="small" /> : <Text style={styles.addButtonText}>אשר עובד חדש</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>ביטול</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  container: { backgroundColor: "#fff", borderRadius: 10, padding: 20, maxHeight: "85%" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 15 },
  error: { color: "red", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#aaa", padding: 10, borderRadius: 6, marginBottom: 10 },
  label: { fontWeight: "600", marginVertical: 8 },
  roleItem: { padding: 10, borderRadius: 6, borderWidth: 1, borderColor: "#ddd", marginBottom: 5 },
  roleItemSelected: { backgroundColor: "#c8f7c5", borderColor: "#5cb85c" },
  addButton: { marginTop: 20, backgroundColor: "#2b7cff", padding: 15, borderRadius: 6 },
  addButtonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  cancelButton: { marginTop: 10, padding: 12 },
  cancelButtonText: { textAlign: "center", color: "#333" },
});
