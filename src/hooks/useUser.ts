import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";
import { User } from "../types/User";
import { useSelector } from "react-redux";
import { State } from "../types/State";

export type AppUser = User & { uid: string };

export default function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }

      try {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as User;

          setUser({
            ...data,
            id: docSnap.id,
            uid: firebaseUser.uid,
          });
        } else {
          console.log("No such user document!");
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

    const userFromDispatchById = useSelector((state: State) => state.data.users.find(u => u.id === user?.id));

    const currentAuthEmail = auth.currentUser?.email;
    const userFromDispatchByEmail = useSelector((state: State) =>
      currentAuthEmail ? state.data.users.find(u => u.email === currentAuthEmail) : undefined
    );

    return userFromDispatchByEmail ?? userFromDispatchById ?? user;
}
