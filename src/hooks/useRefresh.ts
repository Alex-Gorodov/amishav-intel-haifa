import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchUsers } from "../store/api/fetch.api";

export default function useRefresh() {
  const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await fetchUsers(dispatch);
      setRefreshing(false);
    }, [dispatch]);
}
