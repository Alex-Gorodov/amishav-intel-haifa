import { getDocs } from "firebase/firestore";
import { AppDispatch } from "../../types/State";
import { loadUsers, setUsersDataLoading } from "../actions";
import { USERS } from "../../constants";
import { User } from "../../types/User";
import { sanitizeFirestoreData } from "../../utils/sanitizeFirestoreData";

export const fetchUsers = async (dispatch: AppDispatch) => {
  dispatch(setUsersDataLoading({ isUsersDataLoading: true }));

  try {
    const data = await getDocs(USERS);

    const users: User[] = await Promise.all(
      data.docs.map(async (doc) => {
        // 1. Get raw data
        const rawUserData = doc.data();

        // 2. Pass the entire object to your recursive sanitizer
        const userData = sanitizeFirestoreData(rawUserData);

        // 3. Fallbacks apply normally because everything is already a plain primitive string now
        return {
          id: doc.id,
          passportId: userData.passportId || '',
          firstName: userData.firstName || '',
          secondName: userData.secondName || '',
          roles: userData.roles || [],
          shifts: userData.shifts || [],
          email: userData.email || '',
          availability: userData.availability || [],
          isAdmin: userData.isAdmin || false,
          documents: userData.documents || [],
          trainings: userData.trainings || { /* your default trainings block */ },
          phoneNumber: userData.phoneNumber || '',
          avatarUrl: userData.avatarUrl || '',
          createdAt: userData.createdAt || '',
        } as User;
      })
    );

    dispatch(loadUsers({ users }));
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    dispatch(setUsersDataLoading({ isUsersDataLoading: false }));
  }
};
