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
          trainings: userData.trainings || {
            safety: {
              id: `${doc.id}-safety`,
              title: 'הדרכת בטיחות',
              description: '',
              executionDate: null,
              validityPeriod: 365,
            },
            roni: {
              id: `${doc.id}-roni`,
              title: 'רענון רוני',
              description: '',
              executionDate: null,
              validityPeriod: 182,
            },
            weapon: {
              id: `${doc.id}-weapon`,
              title: 'רענון נשק',
              description: '',
              executionDate: null,
              validityPeriod: 182,
            },
            mada: {
              id: `${doc.id}-mada`,
              title: 'רענון אזרה ראשונה',
              description: '',
              executionDate: null,
              validityPeriod: 730,
            },
            rights: {
              id: `${doc.id}-rights`,
              title: 'הדרכת סמכויות',
              description: '',
              executionDate: null,
              validityPeriod: 365,
            }
          },
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
