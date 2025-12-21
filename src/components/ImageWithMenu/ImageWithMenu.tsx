import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, Pressable, TextInput, Modal, Linking, TouchableOpacity } from 'react-native';
import { doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import useUser from '../../hooks/useUser';
import { db } from '../../services/firebaseConfig';
import { fetchUsers } from '../../store/api/fetchUsers.api';
import { useDispatch } from 'react-redux';
import { Colors } from '../../constants';
import CustomButton from '../CustomButton/CustomButton';
import CancelButton from '../CancelButton/CancelButton';

interface Props {
  url: string;
  name: string;
  onPress: () => void;
  menuOpened: boolean;
  setMenuOpened: (v: boolean) => void;
}

export default function ImageWithMenu({ url, name, onPress, menuOpened, setMenuOpened }: Props) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const user = useUser();
  const dispatch = useDispatch();
  const userRef = doc(db, 'users', user?.id!);

  const handleRename = async () => {
    if (!newName.trim()) return;
    const docToUpdate = { url, name };
    const updatedDoc = { url, name: newName.trim() };
    await updateDoc(userRef, { documents: arrayRemove(docToUpdate) });
    await updateDoc(userRef, { documents: arrayUnion(updatedDoc) });
    await fetchUsers(dispatch);
    setEditing(false);
    setMenuOpened(false);
  };

  const handleDelete = async () => {
    const docToRemove = { url, name };
    await updateDoc(userRef, { documents: arrayRemove(docToRemove) });
    await fetchUsers(dispatch);
    setMenuOpened(false);
  };

  return (
    <>
      <Image source={{ uri: url }} style={styles.image} />

      <Modal transparent visible={menuOpened} animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setMenuOpened(false)}>
          <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
            {editing ? (
              <>
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  style={styles.input}
                  autoFocus
                />
                <CustomButton onHandle={handleRename} style={{}} title="שמור שם"/>
                <CancelButton onHandle={() => setEditing(false)}/>
              </>
            ) : (
              <>
                <CustomButton onHandle={() => setEditing(true)} style={{}} title="לשנות שם"/>
                <CustomButton style={{}} onHandle={() => {
                  setMenuOpened(false);
                  Linking.openURL(url);
                }} title="לפתוח בדפדפן"/>
                <CustomButton onHandle={handleDelete} style={[{ backgroundColor: Colors.errorText }]} title="למחוק" titleStyle={{color: Colors.errorText}}/>
                <CancelButton onHandle={() => setMenuOpened(false)}/>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 150, borderRadius: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  menu: { backgroundColor: 'white', padding: 8, borderRadius: 24, width: 300, gap: 8 },
  btnText: { textAlign: 'center', fontWeight: 600 },
  input: { borderWidth: 1, borderColor: Colors.mainDark, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 12 },
});
