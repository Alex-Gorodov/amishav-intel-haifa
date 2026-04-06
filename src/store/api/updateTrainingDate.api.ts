import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { User } from "../../types/User";
import { db } from "../../services/firebaseConfig";

export const updateTrainingDate = async (
  userId: string,
  trainingKey: keyof User['trainings'],
  date: Date
) => {
  try {
    if (!userId) throw new Error('No userId provided');

    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      [`trainings.${trainingKey}.executionDate`]: Timestamp.fromDate(date),
    });

    return { success: true };
  } catch (err: any) {
    console.error('Update training date error:', err);
    return { success: false, error: err.message };
  }
};
