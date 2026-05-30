import * as Haptics from 'expo-haptics';
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchUsers } from "../store/api/fetchUsers.api";
import { fetchSwapRequests, fetchGiveRequests } from "../store/api/fetchRequests.api";
import { fetchProtocolsPreview } from "../store/api/fetchProtocolsPreview.api";

export default function useRefresh() {
  const dispatch = useDispatch();

  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchUsers(dispatch);
    await fetchProtocolsPreview(dispatch);
    await fetchSwapRequests(dispatch);
    await fetchGiveRequests(dispatch);
  }, [dispatch]);

  return {onRefresh}
}
