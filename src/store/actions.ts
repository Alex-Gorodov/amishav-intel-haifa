import { createAction } from "@reduxjs/toolkit";
import { User } from "../types/User";
import { Availability } from "../types/Availability";
import { Document } from "../types/Document";
import { Timestamp } from "firebase/firestore";
import { GiveShiftRequest, RequestStatus, SwapShiftRequest } from "../types/Request";
import { Shift } from "../types/Shift";

export const setUsersDataLoading = createAction<{isUsersDataLoading: boolean}>('data/setUsersDataLoading');
export const loadUsers = createAction<{users: User[]}>('data/loadUsers');

export const setRequestsDataLoading = createAction<{isRequestsDataLoading: boolean}>('data/setRequestsDataLoading');
export const loadRequests = createAction<{type: 'swap' | 'give', requests: SwapShiftRequest[] | GiveShiftRequest[]}>('data/loadRequests');

export const updateAvailability = createAction<{user: User, availability: Availability[]}>('data/updateAvailability');

export const uploadDocument = createAction<{user: User, document: Document}>('data/uploadDocument');

export const updateTraining = createAction<{user: User, date: Timestamp}>('data/updateTraining');

export const sendSwapShiftRequest = createAction<{firstUser: User, secondUser: User, firstUserShiftId: string, secondUserShiftId: string}>('data/SwapShiftRequest');

export const confirmShiftRequest = createAction<{request: SwapShiftRequest | GiveShiftRequest}>('data/confirmShiftRequest');

export const rejectShiftRequest = createAction<{request: SwapShiftRequest | GiveShiftRequest}>('data/rejectShiftRequest');

export const sendGiveShiftRequest = createAction<{fromUser: User, toUser: User, shiftId: string}>('data/giveShiftRequest');

export const updateRequestStatus = createAction<{id: string, status: RequestStatus}>('requests/updateStatus');

export const removeRequest = createAction<string>('requests/remove');

export const setError = createAction<{message: string | null}>('app/setError')

export const setSuccess = createAction<{message: string | null}>('app/setSuccess')

export const updateUserShifts = createAction<{userId: string, shifts: Shift[]}>('data/updateUserShifts');
