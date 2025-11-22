import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../../screens/ProfileScreen';
import DocumentsScreen from '../../screens/DocumentsScreen';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../services/firebaseConfig';
import { Colors } from '../../constants';
import useUser from '../../hooks/useUser';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useFileUpload } from '../../hooks/useFileUpload';

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
  const user = useUser();
  const [uploading, setUploading] = useState(false);

  const { handlePickFileOrImage } = useFileUpload(async ({url, name}) => {
    setUploading(true);

    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        documents: arrayUnion({url, name}),
      });
    } catch (err) {
      console.error('❌ Error saving document:', err);
    } finally {
      setUploading(false);
    }
  });

  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          title: user ? user.firstName : 'בית',

          headerRight: () => (
            <Ionicons
              name="exit-outline"
              size={24}
              color="black"
              onPress={async () => await signOut(auth)}
            />
          ),
        }}
      />

      <Stack.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          title: 'מסמכים',
          headerBackVisible: true,
          headerTintColor: Colors.black,
          headerRight: () => (
            uploading
            ?
            <ActivityIndicator size="small" color="#333"/>
            :
            <Ionicons
              name="add-outline"
              size={24}
              color="black"
              onPress={handlePickFileOrImage}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
}
