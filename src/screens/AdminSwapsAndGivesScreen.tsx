import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../types/State';
import useRefresh from '../hooks/useRefresh';
import { Colors } from '../constants';
import { confirmShiftRequest, rejectShiftRequest } from '../store/actions';
import { GiveShiftRequest, RequestStatus, SwapShiftRequest } from '../types/Request';
import { rejectRequest } from '../store/api/rejectRequest.api';
import { approveGiveRequest, approveSwapRequest } from '../store/api/approveRequest.api';
import { GlobalStyles } from '../constants/GlobalStyles';
import { RequestCard } from '../components/RequestCard/RequestCard';
import { SimpleToggle } from '../components/CustomToggle/CustomToggle';

type PageView = 'swap' | 'give';

export default function AdminSwapsAndGivesScreen() {
  const dispatch = useDispatch();
  const users = useSelector((state: State) => state.data.users);
  const swapRequests = useSelector((state: State) => state.data.swapRequests)
  const giveRequests = useSelector((state: State) => state.data.giveRequests)
  const refresh = useRefresh();

  const [pageView, setPageView] = useState<PageView>('swap');

  const requestsWithShifts = useMemo(() => {
    const source = pageView === 'swap' ? swapRequests : giveRequests;

    return source.map(req => {
      if (req.type === 'swap') {
        const firstShift = users.flatMap(u => u.shifts || []).find(s => s.id === req.firstShiftId) || null;
        const secondShift = users.flatMap(u => u.shifts || []).find(s => s.id === req.secondShiftId) || null;
        return { ...req, fromShift: firstShift, toShift: secondShift };
      } else {
        const firstShift = users.flatMap(u => u.shifts || []).find(s => s.id === req.shiftId) || null;
        return { ...req, fromShift: firstShift };
      }
    });
  }, [pageView, swapRequests, giveRequests, users]);

  const handleConfirm = async (req: SwapShiftRequest | GiveShiftRequest) => {
    try {
      if (req.type === "give") {
        await approveGiveRequest(req);
      } else {
        await approveSwapRequest(req);
      }
      dispatch(confirmShiftRequest({ request: req }));
    } catch (err: any) {
      console.error('Error request confirming: ', err);
    }
  };

  const handleReject = async (req: SwapShiftRequest | GiveShiftRequest) => {
    try {
      await rejectRequest(req);
      dispatch(rejectShiftRequest({ request: req }));
    } catch (err: any) {
      console.error('Error request rejecting: ', err);
    }
  };

  return (
    <View style={styles.container}>
      <SimpleToggle
        value={pageView === 'swap'}
        onChange={(v) => setPageView(v ? 'swap' : 'give')}
        leftLabel="בקשות מסירה"
        rightLabel="בקשות החלפה"
      />

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh.onRefresh} />}
      >
        {requestsWithShifts.length === 0 && (
          <Text style={GlobalStyles.emptyMessage}>
            {pageView === 'swap' ? 'אין בקשות החלפה' : 'אין בקשות מסירה'}
          </Text>
        )}

        <View style={styles.grid}>
          {requestsWithShifts.map(req => {
            const firstUser = users.find(u => u.id === req.firstUserId);
            const secondUser = users.find(u => u.id === req.secondUserId);

            return (
              <RequestCard
                key={req.id}
                req={req}
                isReceived={req.status === RequestStatus.PendingAdmin}
                usersMap={[firstUser, secondUser]}
                onConfirm={handleConfirm}
                onReject={handleReject}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  grid: {
    marginVertical: 8,
    backgroundColor: 'rgb(242,242,242)',
    flexDirection: 'column',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '100%',
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 15,
    gap: 12,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  text: {
    textAlign: 'right',
    color: Colors.mainDark
  },
  buttons: {
    flexDirection: 'row',
    gap: 12
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
  }
})
