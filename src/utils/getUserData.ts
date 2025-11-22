import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";

export const getUserData = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("User data:", docSnap.data());
    return docSnap.data();
  } else {
    console.log("No such user document!");
    return null;
  }
};
