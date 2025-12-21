import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import { State } from '../types/State';
import useRefresh from '../hooks/useRefresh';
import { Colors, SCREEN_WIDTH } from '../constants';
import { Roles } from '../constants/Roles';
import { Ionicons } from '@expo/vector-icons';
import { getWeekDates, toISODate } from '../utils/dateUtils';

export default function ScheduleCreatingScreen() {
  const users = useSelector((state: State) => state.data.users);
  const refresh = useRefresh();
  // next week dates and responsive column width
  const ref = new Date();
  ref.setDate(ref.getDate() + 7);
  const week = getWeekDates(ref, 0, 'he-IL');
  const weekSet = new Set(week.map(w => w.iso));

  const labelWidth = 64; // width reserved for labels column
  const horizontalPadding = 32; // approximate paddings/margins
  const columnWidth = Math.max(40, Math.floor((SCREEN_WIDTH - labelWidth - horizontalPadding) / 7));

  return (
    <FlatList
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refresh.onRefresh} />
      }
      data={users}
      contentContainerStyle={{ paddingBottom: 80 }}
      keyExtractor={(u) => u.id}
      renderItem={({ item: u }) => (
        <View key={`${u.id}-availability`} style={styles.userCard}>
          <Text style={styles.userName}>
            {u.firstName + ' ' + u.secondName}
          </Text>

          <View style={styles.rolesList}>
            <Text style={styles.roleItem}>
              {u.roles
                .map((r) => Roles.find((role) => role.value === r)?.label || r)
                .join(', ')}
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>

              <View style={styles.columnLabels}>
                <Text style={styles.labelCell}>תאריך</Text>
                <Text style={styles.labelCell}>בוקר</Text>
                <Text style={styles.labelCell}>צהריים</Text>
                <Text style={styles.labelCell}>לילה</Text>
              </View>

              <View style={styles.daysRow}>
                {week.map((d) => {
                  const key = `${u.id}-${d.date.getTime()}`;
                  // ищем availability на этот день
                  const a =
                    u.availability.find(av => toISODate(av.date.toDate()) === d.iso) ||
                    { statuses: Array(3).fill(null), date: d.date };

                  return (
                    <View key={key} style={[styles.dayColumn, { minWidth: columnWidth }]}>
                      <View style={styles.dayCell}>
                        <Text style={styles.dateText}>{d.date.getDate()}</Text>
                      </View>

                      {(a.statuses && a.statuses.length > 0
                        ? a.statuses
                        : Array(3).fill(null)
                      ).map((s, i) => (
                        <View key={i} style={styles.statusCell}>
                          {s === true ? (
                            <Ionicons name="checkmark-outline" size={20} />
                          ) : s === false ? (
                            <Ionicons name="close-outline" size={20} />
                          ) : (
                            <Text style={styles.statusText}>-</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>

            </View>
          </ScrollView>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  userCard: {
    marginBottom: 8,
    padding: 4,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.mainDark,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 500,
    textAlign: 'right',
  },
  rolesTitle: {
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.mainDark,
  },
  rolesList: {
    flexDirection: 'row-reverse',
    marginBottom: 4,
    paddingRight: 4,
  },
  roleItem: {
    textAlign: 'right',
    fontSize: 15,
    color: Colors.mainDark,
  },
  table: {
    flexDirection: 'row-reverse',
    marginTop: 8,
  },
  columnLabels: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderColor: Colors.tableBorder,
  },
  labelCell: {
    fontWeight: '700',
    fontSize: 14,
    paddingVertical: 12,
    textAlign: 'center',
    color: Colors.mainDark,
    width: 64,
  },
  daysRow: {
    flexDirection: 'row-reverse',
  },
  dayColumn: {
    flexDirection: 'column',
    borderLeftWidth: 0.7,
    borderColor: Colors.mainLight,
    paddingHorizontal: 2,
  },
  dayCell: {
    paddingVertical: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusCell: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 18,
  },
});
