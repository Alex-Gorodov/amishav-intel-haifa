import { createReducer } from "@reduxjs/toolkit";
import { DataState } from "../../types/State";
import { loadUsers, setUsersDataLoading, updateAvailability, uploadDocument, loadRequests, confirmShiftRequest, rejectShiftRequest, updateRequestStatus, removeRequest, updateUserShifts, updateTrainingExecutionDate, loadProtocolsPreview } from "../actions";
import { SwapShiftRequest, GiveShiftRequest } from "../../types/Request";
import { regenerateShiftId } from "../../utils/regenerateShiftId";
import { Timestamp } from "firebase/firestore";

const initialState: DataState = {
  users: [],
  protocolsPreview: [],
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
    .addCase(loadProtocolsPreview, (state, action) => {
      state.protocolsPreview = action.payload.protocolsPreview;
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

    .addCase(updateTrainingExecutionDate, (state, action) => {
      const { userId, training, date } = action.payload;

      const userToUpdate = state.users.find(u => u.id === userId);
      if (!userToUpdate) return;

      const trainings = userToUpdate.trainings;

      // проходим по всем ключам trainings
      (Object.keys(trainings) as (keyof typeof trainings)[]).forEach(key => {
        if (trainings[key].id === training.id) {
          trainings[key].executionDate = Timestamp.fromDate(date);
        }
      });
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
    })
    .addCase(updateUserShifts, (state, action) => {
      const userToUpdate = state.users.find(u => u.id === action.payload.userId);
      if (userToUpdate) {
        userToUpdate.shifts = action.payload.shifts;
      }
    });

});
