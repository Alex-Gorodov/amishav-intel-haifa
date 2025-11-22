import { combineReducers } from "@reduxjs/toolkit";
import { DataReducer } from "./reducers/dataReducer";

export const rootReducer = combineReducers({
  data: DataReducer,
})

export type RootState = ReturnType<typeof rootReducer>;
