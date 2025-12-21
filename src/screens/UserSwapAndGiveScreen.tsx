import { deleteRequest, userApproveRequest, userRejectRequest } from '../store/api/approveRequest.api';
import { GiveRequestWithShift, RequestStatus, SwapRequestWithShifts } from '../types/Request';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SimpleToggle } from '../components/CustomToggle/CustomToggle';
import { removeRequest, updateRequestStatus } from '../store/actions';
import useHasReceivedRequests from '../hooks/useHasReceivedRequests';
import { RequestCard } from '../components/RequestCard/RequestCard';
import { GlobalStyles } from '../constants/GlobalStyles';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/root-reducer';
import useRefresh from '../hooks/useRefresh';
import { useState } from 'react';

export default function UserSwapAndGiveScreen() {
  type RequestsView = 'sent' | 'received';

  const dispatch = useDispatch();
  const refresh = useRefresh();

  const [requestsView, setRequestsView] = useState<RequestsView>('received');
  const users = useSelector((state: RootState) => state.data.users);

  const { allRequests, receivedRequests, sentRequests } = useHasReceivedRequests();

  const handleConfirm = async (req: GiveRequestWithShift | SwapRequestWithShifts) => {
    try {
      await userApproveRequest(req);

      dispatch(updateRequestStatus({
        id: req.id,
        status: RequestStatus.PendingAdmin,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (req: GiveRequestWithShift | SwapRequestWithShifts) => {
    try {
      await userRejectRequest(req);

      dispatch(updateRequestStatus({
        id: req.id,
        status: RequestStatus.Rejected,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (req: GiveRequestWithShift | SwapRequestWithShifts) => {
    try {
      await deleteRequest(req);
      dispatch(removeRequest(req.id));
    } catch (e) {
      console.error(e);
    }
  };


  return (
    <View style={styles.container}>
      <SimpleToggle
        value={requestsView === 'received'}
        onChange={(v) => setRequestsView(v ? 'received' : 'sent')}
        leftLabel="בקשות ששלחתי"
        rightLabel="בקשות שקיבלתי"
      />

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh.onRefresh} />}
      >

      {allRequests.length === 0 && (
        <Text style={GlobalStyles.emptyMessage}>
          <Text style={GlobalStyles.emptyMessage}>
            {requestsView === 'sent' ? 'לא שלחת אף בקשה' : 'לא קיבלת אף בקשה'}
          </Text>

        </Text>
      )}

      {
        requestsView === 'received' && receivedRequests
        &&
        receivedRequests.map((r) => {
          const firstUser = users.find(u => u.id === r.firstUserId);
          const secondUser = users.find(u => u.id === r.secondUserId);

          return (
            <RequestCard key={`${r.id}`} req={r} isReceived={true} usersMap={[firstUser, secondUser]} onConfirm={handleConfirm} onReject={handleReject} onDelete={handleDelete}/>
          )
        })
      }

      {
        requestsView === 'sent' && sentRequests
        &&
        sentRequests.map((r) => {
          const firstUser = users.find(u => u.id === r.firstUserId);
          const secondUser = users.find(u => u.id === r.secondUserId);

          return (
            <RequestCard key={`${r.id}`} req={r} isReceived={false} usersMap={[firstUser, secondUser]} onConfirm={handleConfirm} onReject={handleReject} onDelete={handleDelete}/>
          )
        })
      }
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    gap: 8
  }
})
