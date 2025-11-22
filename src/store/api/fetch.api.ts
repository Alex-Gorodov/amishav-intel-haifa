import { getDocs } from "firebase/firestore";
import { AppDispatch } from "../../types/State";
import { loadUsers, setUsersDataLoading } from "../actions";
import { USERS } from "../../constants";
import { User } from "../../types/User";

export const fetchUsers = async (dispatch: AppDispatch) => {
  dispatch(setUsersDataLoading({ isUsersDataLoading: true }));

  try {
    const data = await getDocs(USERS);

    const users: User[] = await Promise.all(
      data.docs.map(async (doc) => {
        const userData = doc.data();

        // use doc.id as the canonical document id (firebase docs usually store id in doc.id)
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
