import { Image, StyleSheet, Pressable, TextInput, Modal, Linking } from 'react-native';
import { doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { deleteDocument, renameDocument } from '../../store/actions';
import { useFileUpload } from '../../hooks/useFileUpload';
import CustomButton from '../CustomButton/CustomButton';
import CancelButton from '../CancelButton/CancelButton';
import { db } from '../../services/firebaseConfig';
import useUser from '../../hooks/useUser';
import { useDispatch } from 'react-redux';
import { Colors } from '../../constants';
import React, { useState } from 'react';

interface Props {
  url: string;
  name: string;
  menuOpened: boolean;
  setMenuOpened: (v: boolean) => void;
}

export default function Document({ url, name, menuOpened, setMenuOpened }: Props) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const user = useUser();
  const dispatch = useDispatch();
  const userRef = doc(db, 'users', user?.id!);

  const handleRename = async () => {
    if (!newName.trim() || !user) return;
    const docToUpdate = { url, name };
    const updatedDoc = { url, name: newName.trim() };
    await updateDoc(userRef, { documents: arrayRemove(docToUpdate) });
    await updateDoc(userRef, { documents: arrayUnion(updatedDoc) });
    dispatch(renameDocument({userId: user.id, url, newName: newName}))
    setEditing(false);
    setMenuOpened(false);
  };

  const handleDeleteDocument = async () => {
    if (!user) return;
    const docToRemove = { url, name };
    await updateDoc(userRef, { documents: arrayRemove(docToRemove) });
    dispatch(deleteDocument({userId: user.id, url}))
    setMenuOpened(false);
  };

  const { handlePickFileOrImage } = useFileUpload(async ({url, name}) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, { documents: arrayUnion({ url, name }) });
  });

  const handleUpdateDocument = async () => {
    handlePickFileOrImage();
    await handleDeleteDocument();
  }


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
                <CustomButton onHandle={handleUpdateDocument} style={{}} title="לחדש"/>
                <CustomButton style={{}} onHandle={() => {
                  setMenuOpened(false);
                  Linking.openURL(url);
                }} title="לפתוח בדפדפן"/>
                <CustomButton onHandle={handleDeleteDocument} style={[{ backgroundColor: Colors.errorText }]} title="למחוק" titleStyle={{color: Colors.errorText}}/>
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
