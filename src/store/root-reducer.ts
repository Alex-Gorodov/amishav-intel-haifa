import { combineReducers } from "@reduxjs/toolkit";
import { DataReducer } from "./reducers/dataReducer";
import { AppReducer } from "./reducers/appReducer";

export const rootReducer = combineReducers({
  data: DataReducer,
  app: AppReducer,
})

export type RootState = ReturnType<typeof rootReducer>;
