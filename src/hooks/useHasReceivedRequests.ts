import { useSelector } from "react-redux";
import { RootState } from "../store/root-reducer";
import { useMemo } from "react";
import { getRequestsWithShifts } from "../utils/getRequestsWithShifts";
import useUser from "./useUser";

export default function useHasReceivedRequests() {
  const user = useUser();
  const users = useSelector((state: RootState) => state.data.users);
  const allGiveRequests = useSelector((state: RootState) => state.data.giveRequests)
  const allSwapRequests = useSelector((state: RootState) => state.data.swapRequests)

  const allRequests = useMemo(() => {
    return getRequestsWithShifts(
      [...allGiveRequests, ...allSwapRequests],
      users
    );
  }, [allGiveRequests, allSwapRequests, users]);

  const receivedRequests = user
    ? allRequests.filter(req => req.secondUserId === user.id)
    : [];

  const sentRequests = user
    ? allRequests.filter(req => req.firstUserId === user.id)
    : [];

  const hasReceived = receivedRequests.length > 0;

  return {
    allRequests,
    receivedRequests,
    sentRequests,
    hasReceived
  }
}
