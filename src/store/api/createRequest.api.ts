import { db } from '../../services/firebaseConfig';
import { setDoc, collection, addDoc } from 'firebase/firestore';
import { SwapShiftRequest, GiveShiftRequest, RequestStatus } from '../../types/Request';
import { User } from '../../types/User';

export const sendSwapRequest = async (user: User, currentShiftId: string, chosenShiftId: string, secondUserId: string, details?: string) => {
  try {
    if (!user) throw new Error('No logged-in user');

    const request: SwapShiftRequest = {
      id: '',
      type: 'swap',
      status: RequestStatus.PendingUser,
      createdAt: new Date(),
      updatedAt: new Date(),
      details: details || '',
      firstUserId: user.id,
      secondUserId,
      firstShiftId: currentShiftId,
      secondShiftId: chosenShiftId,
    };

    const docRef = await addDoc(collection(db, 'swapRequests'), request);
    await setDoc(docRef, { ...request, id: docRef.id }); // записываем id внутри документа

    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error('Swap request error:', err);
    return { success: false, error: err.message };
  }
};

export const sendGiveRequest = async (user: User, shiftId: string, secondUserId: string, details?: string) => {
  try {
    if (!user) throw new Error('No logged-in user');

    const request: GiveShiftRequest = {
      id: '',
      type: 'give',
      status: RequestStatus.PendingUser,
      createdAt: new Date(),
      updatedAt: new Date(),
      details: details || '',
      firstUserId: user.id,
      secondUserId,
      shiftId,
    };

    const docRef = await addDoc(collection(db, 'giveRequests'), request);
    await setDoc(docRef, { ...request, id: docRef.id });

    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error('Give request error:', err);
    return { success: false, error: err.message };
  }
};
