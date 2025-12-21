import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchUsers } from "../store/api/fetchUsers.api";
import { fetchSwapRequests, fetchGiveRequests } from "../store/api/fetchRequests.api";

export default function useRefresh() {
  const dispatch = useDispatch();

  const onRefresh = useCallback(async () => {
    await fetchUsers(dispatch);
    await fetchSwapRequests(dispatch);
    await fetchGiveRequests(dispatch);
  }, [dispatch]);

  return {onRefresh}
}
