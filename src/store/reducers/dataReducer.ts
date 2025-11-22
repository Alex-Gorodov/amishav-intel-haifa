import { createReducer } from "@reduxjs/toolkit";
import { DataState } from "../../types/State";
import { loadUsers, setUsersDataLoading, updateAvailability, uploadDocument } from "../actions";

const initialState: DataState = {
  users: [],
  isUsersLoading: false,
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
    });

});
