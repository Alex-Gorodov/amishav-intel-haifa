import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { Shift } from '../types/Shift';
import { sendGiveRequest, sendSwapRequest } from '../store/api/createRequest.api';
import { fetchGiveRequests, fetchSwapRequests } from '../store/api/fetchRequests.api';
import useUser from './useUser';
import { setError, setSuccess } from '../store/actions';
import { ErrorMessages, SuccessMessages } from '../constants/Messages';

export const useShiftRequestActions = () => {
  const user = useUser();
  const dispatch = useDispatch();

  const isFutureShift = (shift: Shift) => {
    const shiftDate = shift.date.toDate();

    const [hours, minutes] = shift.startTime
      .split(':')
      .map(Number);

    shiftDate.setHours(hours, minutes, 0, 0);

    return shiftDate.getTime() > Date.now();
  };

  const swapShift = async ({
    currentShift,
    chosenShift,
    secondUserId,
    onSuccess,
    onError,
  }: {
    currentShift: Shift | null;
    chosenShift: Shift | null;
    secondUserId: string | null;
    onSuccess?: () => void;
    onError?: () => void;
  }) => {
    if (!currentShift || !chosenShift || !user || !secondUserId) {
      dispatch(setError({message: ErrorMessages.MISSING_DATA_FOR_EXCHANGE}))
      return;
    }

    if (!isFutureShift(currentShift) || !isFutureShift(chosenShift)) {
      dispatch(setError({message: ErrorMessages.FUTURE_SHIFTS_ONLY}))
      return;
    }

    try {
      const result = await sendSwapRequest(
        user,
        currentShift.id,
        chosenShift.id,
        secondUserId,
        `בקשת החלפה ממשמרת ${currentShift.post.title} ל-${chosenShift.post.title}`
      );

      if (result.success) {
        dispatch(setSuccess({message: SuccessMessages.SHIFT_SWAP_REQUEST_SENT}));

        fetchSwapRequests(dispatch);
        onSuccess?.();
      } else {
        throw new Error('Swap failed');
      }
    } catch (err) {
      console.error(err);
      dispatch(setError({message: ErrorMessages.REQUEST_NOT_SENT_TRY_AGAIN}))
      onError?.();
    }
  };

  const giveShift = async ({
    currentShift,
    secondUserId,
    onSuccess,
    onError,
  }: {
    currentShift: Shift | null;
    secondUserId: string | null;
    onSuccess?: () => void;
    onError?: () => void;
  }) => {
    if (!currentShift || !user || !secondUserId) {
      dispatch(setError({message: ErrorMessages.MISSING_SHIFT_DATA_FOR_GIVING}))
      return;
    }

    if (!isFutureShift(currentShift)) {
      dispatch(setError({message: ErrorMessages.FUTURE_SHIFTS_ONLY}))
      return;
    }

    try {
      const result = await sendGiveRequest(
        user,
        currentShift.id,
        secondUserId,
        `בקשת מסירת משמרת: ${currentShift.post.title}`
      );

      if (result.success) {
        dispatch(setSuccess({message: SuccessMessages.SHIFT_GIVE_REQUEST_SENT}))
        fetchGiveRequests(dispatch);
        onSuccess?.();
      } else {
        throw new Error('Give shift failed');
      }
    } catch (err) {
      console.error(err);
      dispatch(setError({message: ErrorMessages.REQUEST_NOT_SENT_TRY_AGAIN}))
      onError?.();
    }
  };

  return {
    swapShift,
    giveShift,
  };

};
