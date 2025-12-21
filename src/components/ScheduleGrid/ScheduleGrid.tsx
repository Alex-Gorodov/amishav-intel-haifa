import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { Colors } from '../../constants';
import useUser from '../../hooks/useUser';
import { Ionicons } from '@expo/vector-icons';

  type ShiftRow = {
    id: string;
    name: string;
    // key is date string (e.g. '2025-11-18'), value is cell content (post id or empty)
    shifts: Record<string, string | null>;
  };

  type Props = {
    dates: string[]; // header labels (in order)
    rows: ShiftRow[]; // rows with names and per-date values
    cellWidth?: number;
    rightColumnWidth?: number;
    onCellPress?: (rowId: string, dateKey: string, value: string, row?: ShiftRow ) => void;
  };

  // This component implements a table with:
  // - fixed top header (dates)
  // - fixed right column (posts / primary post per row)
  // - scrollable main grid both horizontally and vertically
  // Implementation: horizontal ScrollView wraps the main grid (header + FlatList). The header and main horizontal scroll are synchronized.
  // The right column is a separate FlatList; vertical scroll is synchronized with the main FlatList.

  export default function ScheduleGrid({ dates, rows, cellWidth = 88, rightColumnWidth, onCellPress }: Props) {
    const user = useUser();
    const horizontalRef = useRef<ScrollView | null>(null);
    const headerRef = useRef<ScrollView | null>(null);
    const mainListRef = useRef<FlatList<any> | null>(null);
    const rightListRef = useRef<FlatList<any> | null>(null);

    const [isRemarkShowed, setRemarkShowed] = useState(false);
    const [remarkToShow, setRemarkToShow] = useState('');

    const [headerHeight, setHeaderHeight] = useState(0);
    const [isMarked, setMarked] = useState(false);

    const { height: windowHeight } = useWindowDimensions();

    const isSyncing = useRef(false);

    const onMainListScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      if (isSyncing.current) return;
      isSyncing.current = true;
      if (rightListRef.current) {
        rightListRef.current.scrollToOffset({ offset: y, animated: false });
      }
      requestAnimationFrame(() => (isSyncing.current = false));
    }, []);

    const onRightListScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      if (isSyncing.current) return;
      isSyncing.current = true;
      if (mainListRef.current) {
        mainListRef.current.scrollToOffset({ offset: y, animated: false });
      }
      requestAnimationFrame(() => (isSyncing.current = false));
    }, []);

    // right column will display row.name (post title) — rows are posts when used for schedule
    // compute dynamic right column width if not provided

    const rightWidth = (() => {
      if (typeof rightColumnWidth === 'number') return rightColumnWidth;
      // estimate based on longest name
      try {
        const maxLen = rows.reduce((m, r) => Math.max(m, (r.name || '').length), 0);
        const est = 120;
        // const est = Math.min(Math.max(120, maxLen * 8 + 24), 320);
        return est;
      } catch (e) {
        return 120;
      }
    })();

    const renderHeader = () => (
      <View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)} style={[styles.headerRow, {backgroundColor: Colors.tableBorder}]}>
        <ScrollView
          ref={headerRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
        >
          {/* render dates in reversed order so visual order is right-to-left */}
          {[...dates].slice().reverse().map((d, i) => {
            // try to format ISO date keys into a readable label
            let label = d;
            if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
              const dt = new Date(d + 'T00:00:00');
              label = dt.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric' });
            }
            return (
              <View key={i} style={[styles.dateCell, { width: cellWidth }]}>
                <Text style={styles.headerText}>{label}</Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.rightHeader, { width: 90, height: 50 }]}>
          <Pressable onPress={() => setMarked(!isMarked)} style={{alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <Ionicons name={isMarked ? 'eye-off-outline' : 'eye-outline'} size={24} color={isMarked ? Colors.placeholder : Colors.mainDark}/>
          </Pressable>
        </View>
      </View>
    );

    const renderRow = ({ item }: { item: ShiftRow; index: number }) => (
      <View style={styles.row}>

        <View style={{ flexDirection: 'row' }}>
          {[...dates].slice().reverse().map((d, i) => {
            const key = d;
            const value = item.shifts[key] ?? null;
            const valueDate = new Date(d + 'T00:00:00');

            const isToday =
              valueDate.toDateString() === new Date().toDateString();

            const isUserAssigned =
              user &&
              value &&
              value.includes(`${user.firstName} ${user.secondName}`);

            const cellBackground =
              isToday
                ? (isMarked && isUserAssigned ? Colors.accent : '#e6e6e6ff')
                : (isMarked && isUserAssigned ? Colors.accent : 'transparent');

            return (
              <TouchableOpacity
                  key={i}
                  style={[styles.cell, { width: cellWidth, backgroundColor: cellBackground }]}
                  onPress={() => {
                    // if parent provided onCellPress, delegate handling to parent (it may have full shift objects)
                    if (onCellPress) {
                      onCellPress(item.id, key, value || '', item );
                      return;
                    }

                    // otherwise try to show remark: support both object with .remark and string values
                    const raw = (item.shifts as any)[key];
                    let remark = '';
                    if (raw && typeof raw === 'object') remark = (raw.remark ?? JSON.stringify(raw));
                    else if (raw) remark = String(raw);
                    // fallback to show raw data for debugging if remark is empty
                    const debug = remark || (raw ? JSON.stringify(raw) : 'אין הערות');
                    setRemarkToShow(debug);
                    setRemarkShowed(true);
                  }}
                >
                  <Text style={[styles.cellText, {fontSize: 14, textAlign: 'center'}]} numberOfLines={2} ellipsizeMode="tail">{value ?? ''}</Text>
                </TouchableOpacity>
            );
          })}
        </View>

      </View>
    );

    const gridHeight = Math.max(120, windowHeight - headerHeight - 135 - 150);

    // On mount, scroll the horizontal area and header to the end (right side)
    useEffect(() => {
      // wait for layout to settle
      requestAnimationFrame(() => {
        try {
          horizontalRef.current?.scrollToEnd({ animated: false });
          headerRef.current?.scrollToEnd({ animated: false });
        } catch (e) {
          // ignore if refs not ready
        }
      });
    }, [dates.length, cellWidth]);

    return (
      <View style={styles.container}>
        {renderHeader()}

        {/* <Modal transparent visible={isRemarkShowed} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalText}>{remarkToShow}</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setRemarkShowed(false)}>
                <Text style={{ color: '#eee', fontWeight: '600' }}>סגור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal> */}



        {/* main area: constrain height so table ends above navigation (bottom spacing ~100px) */}
        <View style={{ flexDirection: 'row', height: gridHeight }}>
          <ScrollView
              ref={horizontalRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const { x } = e.nativeEvent.contentOffset;
                if (headerRef.current) headerRef.current.scrollTo({ x, animated: false });
              }}
              scrollEventThrottle={16}
            >
            <FlatList
              ref={mainListRef}
              data={rows}
              keyExtractor={(r) => r.id}
              renderItem={renderRow}
              onScroll={onMainListScroll}
              scrollEventThrottle={16}
              style={{  width: dates.length * cellWidth, height: gridHeight }}
            />
            {/* right column separate to keep it fixed */}
          </ScrollView>
          <FlatList
            ref={rightListRef}
            data={rows}
            keyExtractor={(r) => r.id}
            renderItem={({ item }) => (
              <View style={styles.rightCell}>
                <Text style={styles.cellText} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
              </View>
            )}
            onScroll={onRightListScroll}
            scrollEventThrottle={16}
            style={{ width: rightWidth, height: gridHeight }}
          />
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, borderColor: Colors.mainDark, borderBottomWidth: 10 },
    headerRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#6f6f6f' },
    headerText: { fontWeight: '600', textAlign: 'right' },
    dateCell: { paddingHorizontal: 8, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderColor: '#6f6f6f' },
    row: { flexDirection: 'row', alignItems: 'center', height: 50 },
    cell: { height: 50, padding: 0, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderBottomWidth: 1, borderColor: Colors.tableBorder },
    cellText: { fontSize: 10, flexWrap: 'wrap', textAlign: 'right' },
    rightHeader: { flexDirection: 'row', justifyContent: 'center', borderLeftWidth: 1,  borderColor: '#6f6f6f' },
    rightCell: { padding: 8, height: 50, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 2, borderBottomWidth: 1, borderColor: Colors.tableBorder },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalCard: { width: '80%', backgroundColor: '#eee', padding: 16, borderRadius: 12, alignItems: 'center' },
    modalText: { marginBottom: 12, textAlign: 'center', color: Colors.mainDark },
    modalClose: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 18, backgroundColor: Colors.mainDark, borderRadius: 8 },
  });
