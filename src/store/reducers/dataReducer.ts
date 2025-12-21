import { createReducer } from "@reduxjs/toolkit";
import { DataState } from "../../types/State";
import { loadUsers, setUsersDataLoading, updateAvailability, updateTraining, uploadDocument, loadRequests, confirmShiftRequest, rejectShiftRequest, updateRequestStatus, removeRequest } from "../actions";
import { SwapShiftRequest, GiveShiftRequest } from "../../types/Request";
import { regenerateShiftId } from "../../utils/regenerateShiftId";

const initialState: DataState = {
  users: [],
  isUsersLoading: false,
  swapRequests: [],
  giveRequests: [],
  isRequestsDataLoading: false,
};

export const DataReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(loadUsers, (state, action) => {
      state.users = action.payload.users;
    })
    .addCase(setUsersDataLoading, (state, action) => {
      state.isUsersLoading = action.payload.isUsersDataLoading;
    })
    .addCase(updateAvailability, (state, action) => {
      const userToUpdate = state.users.find((u) => u.id === action.payload.user.id);

      if (userToUpdate) {
        userToUpdate.availability = [
          ...(userToUpdate.availability || []),
          ...action.payload.availability
        ];
      }
    })
    .addCase(uploadDocument, (state, action) => {
      const userToUpdate = state.users.find(u => u.id === action.payload.user.id);
      if (!userToUpdate) return;

      if (!userToUpdate.documents) userToUpdate.documents = [];
      userToUpdate.documents.push(action.payload.document);
    })

    //TODO: implement training update in reducer
    .addCase(updateTraining, (state, action) => {
      const userToUpdate = state.users.find(u => u.id === action.payload.user.id);
      if (!userToUpdate) return;
    })
    .addCase(loadRequests, (state, action) => {
      if (action.payload.type === 'swap') {
        state.swapRequests = action.payload.requests as SwapShiftRequest[];
      } else {
        state.giveRequests = action.payload.requests as GiveShiftRequest[];
      }
    })
    .addCase(confirmShiftRequest, (state, action) => {
      const req = action.payload.request;
      const now = new Date();

      if (req.type === 'swap') {
        const { firstUserId, secondUserId, firstShiftId, secondShiftId } = req;

        const firstUser = state.users.find(u => u.id === firstUserId);
        const secondUser = state.users.find(u => u.id === secondUserId);
        if (!firstUser || !secondUser) return;

        const firstShiftIndex = firstUser.shifts?.findIndex(s => s.id === firstShiftId) ?? -1;
        const secondShiftIndex = secondUser.shifts?.findIndex(s => s.id === secondShiftId) ?? -1;
        if (firstShiftIndex === -1 || secondShiftIndex === -1) return;

        const firstShift = firstUser.shifts![firstShiftIndex];
        const secondShift = secondUser.shifts![secondShiftIndex];

        firstUser.shifts!.splice(firstShiftIndex, 1);
        secondUser.shifts!.splice(secondShiftIndex, 1);

        firstUser.shifts!.push({
          ...secondShift,
          id: regenerateShiftId(secondShift.id),

        });

        secondUser.shifts!.push({
          ...firstShift,
          id: regenerateShiftId(firstShift.id),

        });

        state.swapRequests = state.swapRequests.filter(r => r.id !== req.id);
      }

      if (req.type === 'give') {
        const { firstUserId, secondUserId, shiftId } = req;

        const fromUser = state.users.find(u => u.id === firstUserId);
        const toUser = state.users.find(u => u.id === secondUserId);
        if (!fromUser || !toUser) return;

        const shiftIndex = fromUser.shifts?.findIndex(s => s.id === shiftId) ?? -1;
        if (shiftIndex === -1) return;

        const shift = fromUser.shifts![shiftIndex];

        fromUser.shifts!.splice(shiftIndex, 1);

        toUser.shifts!.push({
          ...shift,
          id: regenerateShiftId(shift.id),
        });

        state.giveRequests = state.giveRequests.filter(r => r.id !== req.id);
      }
    })
    .addCase(rejectShiftRequest, (state, action) => {
      const req = action.payload.request;

      if (req.type === 'swap') {
        state.swapRequests = state.swapRequests.filter(r => r.id !== req.id);
      }

      if (req.type === 'give') {
        state.giveRequests = state.giveRequests.filter(r => r.id !== req.id);
      }
    })
    .addCase(updateRequestStatus, (state, action) => {
      const req = state.giveRequests.find(r => r.id === action.payload.id) || state.swapRequests.find(r => r.id === action.payload.id);
      if (req) req.status = action.payload.status;
    })
    .addCase(removeRequest, (state, action) => {
      state.swapRequests = state.swapRequests.filter(r => r.id !== action.payload);
      state.giveRequests = state.giveRequests.filter(r => r.id !== action.payload);
    });

});
