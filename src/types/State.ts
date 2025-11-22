import { store } from "../store";
import { User } from "./User";


export type State = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type DataState = {
  users: User[];
  isUsersLoading: boolean;
}
