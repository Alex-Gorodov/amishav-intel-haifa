import { createReducer } from "@reduxjs/toolkit";
import { AppState } from "../../types/State";
import { setError, setSuccess } from "../actions";

const initialState: AppState = {
  error: null,
  success: null,
}

export const AppReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setError, (state, action) => {
      state.error = action.payload.message;
    })
    .addCase(setSuccess, (state, action) => {
      state.success = action.payload.message;
    })
})
