import { store } from "../store";
import { GiveShiftRequest, SwapShiftRequest } from "./Request";
import { User } from "./User";


export type State = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type DataState = {
  users: User[];
  isUsersLoading: boolean;
  swapRequests: SwapShiftRequest[];
  giveRequests: GiveShiftRequest[];
  isRequestsDataLoading: boolean;
}

export type AppState = {
  error: string | null;
  success: string | null;
}
