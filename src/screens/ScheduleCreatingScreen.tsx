import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { saveMultipleUsersShifts } from '../store/api/saveShifts.api';
import CustomButton from '../components/CustomButton/CustomButton';
import { generateSchedule } from '../utils/scheduleGenerator';
import { normalizeDate } from '../utils/getCurrentWeekDates';
import { getWeekDates, toISODate } from '../utils/dateUtils';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserShifts } from '../store/actions';
import { Colors, SCREEN_WIDTH } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import useRefresh from '../hooks/useRefresh';
import { Roles } from '../constants/Roles';
import React, { useState } from 'react';
import { State } from '../types/State';

export default function ScheduleCreatingScreen() {
  const users = useSelector((state: State) => state.data.users);
  const dispatch = useDispatch();
  const refresh = useRefresh();
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const ref = new Date();
  ref.setDate(ref.getDate() + 7);
  const week = getWeekDates(ref, 0, 'he-IL');
  const weekDates = week.map(w => w.date);

  const labelWidth = 64;
  const horizontalPadding = 32;
  const columnWidth = Math.max(40, Math.floor((SCREEN_WIDTH - labelWidth - horizontalPadding) / 7));

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    setErrorMessages([]);

    try {
      const result = generateSchedule(users, weekDates[0], weekDates, { debug: true, forceFresh: true, debugUser: 'אלכסנדר גורודוב' });

      let totalShifts = 0;
      const shiftsByUser: Record<string, number> = {};
      for (const [userId, shifts] of result.shifts.entries()) {
        totalShifts += shifts.length;
        shiftsByUser[userId] = shifts.length;
      }
      const allShiftsByUserId = new Map<string, any[]>();

      for (const user of users) {
        const existingShifts = user.shifts || [];
        const newShifts = result.shifts.get(user.id) || [];

        const targetWeekStart = weekDates[0];
        const targetWeekEnd = new Date(targetWeekStart);
        targetWeekEnd.setDate(targetWeekStart.getDate() + 7);

        const shiftsOutsideTargetWeek = existingShifts.filter(shift => {
          const shiftDate = normalizeDate(shift.date);
          return shiftDate < targetWeekStart || shiftDate >= targetWeekEnd;
        });

        allShiftsByUserId.set(user.id, [...shiftsOutsideTargetWeek, ...newShifts]);
      }

      const saveResult = await saveMultipleUsersShifts(allShiftsByUserId);

      if (!saveResult.success) {
        const errorMsg = `שגיאת שמירה: ${saveResult.error}`;
        const messages = [errorMsg, ...result.errors];
        setErrorMessages(messages);
        setErrorModalVisible(true);
        setIsGenerating(false);
        return;
      }
      for (const [userId, shifts] of allShiftsByUserId.entries()) {
        dispatch(updateUserShifts({ userId, shifts }));
      }

      const allMessages = [...result.errors, ...result.warnings];

      if (result.errors.length > 0 || result.warnings.length > 0) {
        const messages = [
          `הסידור נוצר חלקית.`,
          `משמרות שהוקצו: ${totalShifts}`,
          '',
          ...allMessages
        ];
        setErrorMessages(messages);
        setErrorModalVisible(true);
      } else if (totalShifts > 0) {
        const successMsg = `הסידור נוצר בהצלחה!\nמשמרות שהוקצו: ${totalShifts}`;
        Alert.alert('הצלחה', successMsg);
      } else {
        const noShiftsMsg = 'לא ניתן להקצות אף משמרת. בדוק/י את זמינות העובדים.';
        setErrorMessages([noShiftsMsg]);
        setErrorModalVisible(true);
      }
    } catch (error: any) {
      const errorMsg = `שגיאה: ${error.message || 'שגיאה לא ידועה'}`;
      setErrorMessages([errorMsg]);
      setErrorModalVisible(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <FlatList
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refresh.onRefresh} />
        }
        data={users}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyExtractor={(u) => u.id}
        ListHeaderComponent={
          <View style={styles.headerButtonContainer}>
            <CustomButton
              title={isGenerating ? <ActivityIndicator color={Colors.mainDark} /> : 'בנה סידור!'}
              onHandle={handleGenerateSchedule}
              disabled={isGenerating}
              style={styles.generateButton}
            />
          </View>
        }
        renderItem={({ item: u }) => {
          const commentsForWeek = u.availability
            .filter(av =>
              week.some(d => toISODate(normalizeDate(av.date)) === d.iso)
            )
            .filter(av => av.comment && av.comment.trim() !== '')
            .map(av => ({
              date: normalizeDate(av.date),
              comment: av.comment,
            }));
          return (
            <View key={`${u.id}-availability`} style={styles.userCard}>
              <Text style={styles.userName}>
                {u.firstName + ' ' + u.secondName}
              </Text>

              <View style={styles.userCardLine}>
                <Text style={styles.userCardtext}>
                  {u.roles
                    .map((r) => Roles.find((role) => role.value === r)?.label || r)
                    .join(', ')}
                </Text>

              </View>

              {commentsForWeek.length > 0 && (
                <View style={styles.userCardLine}>
                  <Text style={styles.userCardtext}>הערות:</Text>
                  <View style={{ marginTop: 8 }}>
                    {commentsForWeek.map((c, i) => (
                      <View key={i} style={styles.commentByDate}>
                        <Text style={styles.userCardtext}>
                          :
                          {c.date.toLocaleDateString('he-IL', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </Text>
                        <Text style={styles.userCardtext}> {c.comment}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

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

                      const a =
                        u.availability.find(av => toISODate(normalizeDate(av.date)) === d.iso) ||
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
          )
        }}
    />

    <Modal
      visible={errorModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setErrorModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>תוצאת יצירת הסידור</Text>
          <ScrollView style={styles.errorScrollView}>
            {errorMessages.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                {error}
              </Text>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setErrorModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>סגור</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
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
  userCardLine: {
    flexDirection: 'column',
    marginBottom: 4,
    paddingRight: 4,
  },
  userCardtext: {
    textAlign: 'right',
    fontSize: 15,
    color: Colors.mainDark,
  },
  commentByDate: {
    flexDirection: 'row-reverse'
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
  headerButtonContainer: {
    padding: 16,
  },
  generateButton: {
    minWidth: 200,
    backgroundColor: Colors.mainDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: Colors.mainDark,
  },
  errorScrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'right',
  },
  modalButton: {
    backgroundColor: Colors.mainDark,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
