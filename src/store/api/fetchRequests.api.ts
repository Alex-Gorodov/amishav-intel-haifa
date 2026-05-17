import { getDocs } from "firebase/firestore";
import { SWAP_REQUESTS, GIVE_REQUESTS } from "../../constants";
import { SwapShiftRequest, GiveShiftRequest } from "../../types/Request";
import { AppDispatch } from "../../types/State";
import { setRequestsDataLoading, loadRequests } from "../actions";
import { normalizeDate } from "../../utils/getCurrentWeekDates";

// fetch swap requests
export const fetchSwapRequests = async (dispatch: AppDispatch) => {
  dispatch(setRequestsDataLoading({ isRequestsDataLoading: true }));

  try {
    const data = await getDocs(SWAP_REQUESTS);

    const requests: SwapShiftRequest[] = data.docs.map(doc => {
      const requestData = doc.data() as any;
      return {
        id: doc.id,
        type: 'swap',
        status: requestData.status || 'pending',
        createdAt: requestData.createdAt?.toDate ? normalizeDate(requestData.createdAt) : new Date(),
        updatedAt: requestData.updatedAt?.toDate ? normalizeDate(requestData.updatedAt) : new Date(),
        details: requestData.details || '',
        firstUserId: requestData.firstUserId,
        secondUserId: requestData.secondUserId,
        firstShiftId: requestData.firstShiftId,
        secondShiftId: requestData.secondShiftId,
      } as SwapShiftRequest;
    });

    dispatch(loadRequests({ type: 'swap', requests }));

  } finally {
    dispatch(setRequestsDataLoading({ isRequestsDataLoading: false }));
  }
};

// fetch give requests
export const fetchGiveRequests = async (dispatch: AppDispatch) => {
  dispatch(setRequestsDataLoading({ isRequestsDataLoading: true }));

  try {
    const data = await getDocs(GIVE_REQUESTS);

    const requests: GiveShiftRequest[] = data.docs.map(doc => {
      const requestData = doc.data() as any;
      return {
        id: doc.id,
        type: 'give',
        status: requestData.status || 'pending',
        createdAt: requestData.createdAt?.toDate ? normalizeDate(requestData.createdAt) : new Date(),
        updatedAt: requestData.updatedAt?.toDate ? normalizeDate(requestData.updatedAt) : new Date(),
        details: requestData.details || '',
        firstUserId: requestData.firstUserId,
        secondUserId: requestData.secondUserId,
        shiftId: requestData.shiftId,
      } as GiveShiftRequest;
    });

    dispatch(loadRequests({ type: 'give', requests }));

  } finally {
    dispatch(setRequestsDataLoading({ isRequestsDataLoading: false }));
  }
};
