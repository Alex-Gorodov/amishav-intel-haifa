import { doc, deleteDoc } from 'firebase/firestore';
import { GiveShiftRequest, SwapShiftRequest } from '../../types/Request';
import { db } from '../../services/firebaseConfig';

export const rejectRequest = async (
  req: SwapShiftRequest | GiveShiftRequest
) => {
  const ref =
    req.type === 'swap'
      ? doc(db, 'swapRequests', req.id)
      : doc(db, 'giveRequests', req.id);

  await deleteDoc(ref);
};
