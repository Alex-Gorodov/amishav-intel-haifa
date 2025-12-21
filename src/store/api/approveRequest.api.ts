import { deleteDoc, doc, runTransaction, updateDoc } from 'firebase/firestore';
import { SwapShiftRequest, GiveShiftRequest, GiveRequestWithShift, RequestStatus, SwapRequestWithShifts } from '../../types/Request';
import { db } from '../../services/firebaseConfig';

export const approveSwapRequest = async (req: SwapShiftRequest) => {
  const requestRef = doc(db, 'swapRequests', req.id);
  const firstUserRef = doc(db, 'users', req.firstUserId);
  const secondUserRef = doc(db, 'users', req.secondUserId);

  await runTransaction(db, async (transaction) => {
    const firstUserSnap = await transaction.get(firstUserRef);
    const secondUserSnap = await transaction.get(secondUserRef);
    const requestSnap = await transaction.get(requestRef);

    if (!firstUserSnap.exists() || !secondUserSnap.exists() || !requestSnap.exists()) {
      throw new Error('Data not found');
    }

    if (requestSnap.data().status !== RequestStatus.PendingAdmin) {
      throw new Error('Request already processed');
    }

    const firstUser = firstUserSnap.data();
    const secondUser = secondUserSnap.data();

    const firstShift = firstUser.shifts.find((s: any) => s.id === req.firstShiftId);
    const secondShift = secondUser.shifts.find((s: any) => s.id === req.secondShiftId);

    if (!firstShift || !secondShift) {
      throw new Error('Shift not found');
    }

    const updatedFirstShifts = firstUser.shifts
      .filter((s: any) => s.id !== req.firstShiftId)
      .concat({ ...secondShift, userId: req.firstUserId });

    const updatedSecondShifts = secondUser.shifts
      .filter((s: any) => s.id !== req.secondShiftId)
      .concat({ ...firstShift, userId: req.secondUserId });

    transaction.update(firstUserRef, { shifts: updatedFirstShifts });
    transaction.update(secondUserRef, { shifts: updatedSecondShifts });

    // 🔥 удаляем запрос
    transaction.delete(requestRef);
  });
};

export const approveGiveRequest = async (req: GiveShiftRequest) => {
  const requestRef = doc(db, 'giveRequests', req.id);
  const fromUserRef = doc(db, 'users', req.firstUserId);
  const toUserRef = doc(db, 'users', req.secondUserId);

  await runTransaction(db, async (transaction) => {
    const fromSnap = await transaction.get(fromUserRef);
    const toSnap = await transaction.get(toUserRef);
    const requestSnap = await transaction.get(requestRef);

    if (!fromSnap.exists() || !toSnap.exists() || !requestSnap.exists()) {
      throw new Error('Data not found');
    }

    if (requestSnap.data().status !== RequestStatus.PendingAdmin) {
      throw new Error('Request already processed');
    }

    const fromUser = fromSnap.data();
    const toUser = toSnap.data();

    const shift = fromUser.shifts.find((s: any) => s.id === req.shiftId);
    if (!shift) throw new Error('Shift not found');

    transaction.update(fromUserRef, {
      shifts: fromUser.shifts.filter((s: any) => s.id !== req.shiftId),
    });

    transaction.update(toUserRef, {
      shifts: [...toUser.shifts, { ...shift, userId: req.secondUserId }],
    });

    transaction.delete(requestRef);
  });
};


export const userApproveRequest = async (req: GiveRequestWithShift | SwapRequestWithShifts) => {
  const collection = req.type === 'give' ? 'giveRequests' : 'swapRequests';
  const ref = doc(db, collection, req.id);

  await updateDoc(ref, {
    status: RequestStatus.PendingAdmin,
    updatedAt: new Date(),
  });
};

export const userRejectRequest = async (req: GiveRequestWithShift | SwapRequestWithShifts) => {
  const collection = req.type === 'give' ? 'giveRequests' : 'swapRequests';
  const ref = doc(db, collection, req.id);

  await updateDoc(ref, {
    status: RequestStatus.Rejected,
    updatedAt: new Date(),
  });
};

export const deleteRequest = async (req: GiveRequestWithShift | SwapRequestWithShifts) => {
  const collection = req.type === 'give' ? 'giveRequests' : 'swapRequests';
  const ref = doc(db, collection, req.id);

  await deleteDoc(ref);
};
