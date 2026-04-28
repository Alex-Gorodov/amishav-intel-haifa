import { store } from "../store";
import { Post } from "./Post";
import { ProtocolPreview } from "./Protocol";
import { GiveShiftRequest, SwapShiftRequest } from "./Request";
import { User } from "./User";


export type State = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type DataState = {
  users: User[];
  protocolsPreview: ProtocolPreview[];
  isUsersLoading: boolean;
  swapRequests: SwapShiftRequest[];
  giveRequests: GiveShiftRequest[];
  isRequestsDataLoading: boolean;
  posts: Post[];
}

export type AppState = {
  error: string | null;
  success: string | null;
}
