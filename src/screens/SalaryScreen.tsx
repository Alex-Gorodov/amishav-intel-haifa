import { Animated, RefreshControl, StyleSheet, Text, View, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { getMonthlySalary, getShiftSalary } from '../utils/getShiftSalary';
import { getWeekKeyForShift } from '../utils/getWeekKeyForShift';
import { useShabbatByWeek } from '../hooks/useShabbatByWeek';
import { getShiftDuration } from '../utils/getShiftDuration';
import useUser from '../hooks/useUser';
import useRefresh from '../hooks/useRefresh';
import { Colors, CURRENT_DATE } from '../constants';
import { useMemo, useRef, useState } from 'react';
import SummarySalary from '../components/SummarySalary/SummarySalary';
import { Ionicons } from '@expo/vector-icons';
import ShiftCard from '../components/ShiftCard/ShiftCard';
import { GlobalStyles } from '../constants/GlobalStyles';
import { getHoursString } from '../utils/getHoursString';
import { getMonthlyHours } from '../utils/getMonthlyHours';
import { getShabbatHoursString } from '../utils/getShabbatHours';

export default function SalaryScreen() {
  const user = useUser();
  const refresh = useRefresh();
  const [displayDate, setDisplayDate] = useState(CURRENT_DATE);
  const [isFutureExpanded, setIsFutureExpanded] = useState(false);

  const HEADER_MAX_HEIGHT = 180;
  const HEADER_MIN_HEIGHT = 50;
  const MONTH_NAV_HEIGHT = 44;

  const futureOpacity = useRef(new Animated.Value(0)).current;
  const futureHeight = useRef(new Animated.Value(0)).current;
  const rotateArrow = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef<number>(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  const monthTop = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const shifts = useMemo(() => {
    return user?.shifts.filter((s) => {
      const d = s.date.toDate();
      return d.getMonth() === displayDate.getMonth() && d.getFullYear() === displayDate.getFullYear();
    }) ?? [];
  }, [user?.shifts, displayDate]);

  const shabbatByWeek = useShabbatByWeek(shifts);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentShifts = shifts.filter(s => {
    const shiftDate = new Date(s.date.toDate());
    shiftDate.setHours(0, 0, 0, 0);
    return shiftDate.getTime() <= today.getTime();
  });

  const futureShifts = shifts.filter(s => {
    const shiftDate = new Date(s.date.toDate());
    shiftDate.setHours(0, 0, 0, 0);
    return shiftDate.getTime() > today.getTime();
  });

  const sortedCurrentShifts = [...currentShifts].sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime());
  const sortedFutureShifts = [...futureShifts].sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime());

  const toggleFutureShifts = () => {
    const willExpand = !isFutureExpanded;
    setIsFutureExpanded(willExpand);

    Animated.parallel([
      Animated.timing(futureOpacity, {
        toValue: willExpand ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateArrow, {
        toValue: willExpand ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(futureHeight, {
        toValue: willExpand ? (contentHeight.current || 0) : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const FutureList = () => (
    <>
      {sortedFutureShifts.map((shift, i) => (
        <ShiftCard key={`future-${i}`} shift={shift} index={i} shabbatByWeek={shabbatByWeek} keyPrefix="future" />
      ))}
    </>
  );

  const hours = getMonthlyHours(user?.shifts ?? []).toFixed(2);

  const totalHours = getHoursString(Number(hours));

  const totalShabbatHours = user && getShabbatHoursString(shifts, shabbatByWeek);

  const totalSalary = getMonthlySalary(shifts, shabbatByWeek);

  const goToPrevMonth = () => {
    const d = new Date(displayDate);
    d.setMonth(d.getMonth() - 1);
    setDisplayDate(d);
  };

  const goToNextMonth = () => {
    const d = new Date(displayDate);
    d.setMonth(d.getMonth() + 1);
    setDisplayDate(d);
  };

  return (
    <View style={styles.container}>

      <SummarySalary
        totalHours={totalHours}
        totalShabbatHours={totalShabbatHours || '0'}
        totalSalary={totalSalary}
        scrollY={scrollY}
      />

      <Animated.View style={[styles.monthNav, { position: 'absolute', left: 0, right: 0, top: monthTop, zIndex: 11, height: MONTH_NAV_HEIGHT }]} pointerEvents="box-none">

        <TouchableOpacity
          onPress={goToPrevMonth}
          hitSlop={{ top: 12, bottom: 12, left: 24, right: 12 }}
        >
          <Ionicons name="chevron-back" size={20} />
        </TouchableOpacity>

        <Text style={styles.monthLabel}>{displayDate.toLocaleString('he-IL', { month: 'long', year: 'numeric' })}</Text>

        <TouchableOpacity
          onPress={goToNextMonth}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}
        >
          <Ionicons name="chevron-forward" size={20} />
        </TouchableOpacity>

      </Animated.View>

      {
        shifts.length !== 0
        ?
        <Animated.ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT + MONTH_NAV_HEIGHT + 8, paddingBottom: 80, paddingHorizontal: 8 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refresh.onRefresh}/>
          }
        >

          {futureShifts.length > 0 && (
            <View>
              <Pressable
                style={styles.expandButton}
                onPress={toggleFutureShifts}
              >
                <Animated.Text
                  style={[
                    styles.expandButtonText,
                    {
                      transform: [
                        {
                          rotate: rotateArrow.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '-90deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons name="chevron-back" size={20} />
                </Animated.Text>
                <Text style={styles.expandButtonText}>משמרות עתידיות</Text>
              </Pressable>

              <Animated.View
                style={{
                  opacity: futureOpacity,
                  height: futureHeight,
                }}
              >
                <View>
                  <FutureList />
                </View>
              </Animated.View>

              <View style={{ position: 'absolute', top: HEADER_MAX_HEIGHT + MONTH_NAV_HEIGHT, left: 0, right: 0, opacity: 0 }} pointerEvents={"none"}
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height;
                  if (h > 0 && contentHeight.current !== h) {
                    contentHeight.current = h;
                    if (isFutureExpanded) {
                      futureHeight.setValue(h);
                    }
                  }
                }}
              >
                <FutureList />
              </View>
            </View>
          )}

          {sortedCurrentShifts.map((shift, i) => (
            <ShiftCard key={`current-${i}`} shift={shift} index={i} shabbatByWeek={shabbatByWeek} keyPrefix="current" />
          ))}

        </Animated.ScrollView>
        :
        <Text style={[GlobalStyles.emptyMessage, { paddingTop: HEADER_MAX_HEIGHT + MONTH_NAV_HEIGHT + 10 }]}>אין נתונים</Text>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, backgroundColor: '#fafafa', boxShadow: '0px 2px 4px rgba(0,0,0,0.2)' },
  monthLabel: { textAlign: 'center', minWidth: 120, fontSize: 16, fontWeight: '700', marginHorizontal: 12 },
  card: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.17,
    shadowRadius: 6,
    elevation: 3,
  },
  date: { textAlign: 'right', fontSize: 16, fontWeight: '600', marginBottom: 8, color: Colors.mainDark },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 2 },
  label: { textAlign: 'right', fontSize: 15, color: '#666' },
  value: { textAlign: 'right', fontSize: 15, fontWeight: '500', color: '#222' },
  pay: { textAlign: 'right', fontSize: 16, fontWeight: '700', color: '#0A6A20' },
  expandButton: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 10,
    marginVertical: 12,

    justifyContent: 'space-between',
  },
  expandButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.mainDark,
    textAlign: 'right',
  },
});
