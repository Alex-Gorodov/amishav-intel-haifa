import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Shift } from '../../types/Shift';
import { GuardTasks, BlockedOnWeekend } from '../../constants/GuardTasks';
import { GuardTask } from '../../types/GuardTask';
import ShiftActionsModal from '../ShiftActionsModal/ShiftActionsModal';

interface PrivateShiftCardProps {
  shift: Shift;
  onToggleMenu: () => void;
  isInfoOpen: boolean;
  onToggleInfo: () => void;
}

export default function PrivateShiftCard({ shift, onToggleMenu }: PrivateShiftCardProps) {
  const date = shift.date.toDate();
  const formattedDate = date.toLocaleDateString('he-IL', { weekday: 'long', day: '2-digit', month: '2-digit' });
  const [tasksForShift, setTasksForShift] = useState<GuardTask[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);

  const backgroundColor = new Date().toDateString() === date.toDateString() ? '#e0f7fa' : '#fff';

  const prepareTasks = () => {
    const isWeekend = date.getDay() === 5 || date.getDay() === 6;
    const basePostId = shift.post.id.replace(/-(morning|afternoon|night)$/, '');
    const suffixMatch = shift.post.id.match(/-(morning|afternoon|night)$/);
    const suffix = suffixMatch ? suffixMatch[1] : null;
    const weekendPostId = suffix ? `${basePostId}-${suffix}-weekend` : `${basePostId}-weekend`;

    const filteredTasks = GuardTasks.filter(t => {
      if (!isWeekend) return t.postId === shift.post.id;
      if (suffix && GuardTasks.some(task => task.postId === weekendPostId)) return t.postId === weekendPostId;
      if (GuardTasks.some(task => task.postId === `${basePostId}-weekend`)) return t.postId === `${basePostId}-weekend`;
      return t.postId === shift.post.id;
    }).map(t => ({ ...t, isBlocked: isWeekend && BlockedOnWeekend.includes(t.postId) }));

    setTasksForShift(filteredTasks);
  }

  const [currentShift, setCurrentShift] = useState(shift);

  const [modalType, setModalType] = useState<'give' | 'swap' | 'details' | null>(null);

  const openModal = (type: 'give' | 'swap' | 'details') => {
    setModalType(type);
    setCurrentShift(shift);
    setSelectedShiftId(shift.id);
    prepareTasks();
    setModalOpen(true);
    onToggleMenu();
  };

  return (
    <Pressable onPress={() => openModal('details')}
      style={({ pressed }) => ([styles.card, {
        backgroundColor: pressed ? '#E6E6E6' : backgroundColor,
        padding: 12,
        borderRadius: 12,
      }])}
    >
      {/*
      <TouchableOpacity onPress={() => openModal('details')} style={{ alignSelf: 'center' }} hitSlop={{ top: 18, bottom: 18, left: 18, right: 18 }}>
        <Ionicons name="ellipsis-vertical" size={20} color={'#333'} />
      </TouchableOpacity>
      */}

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{shift.post.title}</Text>
        <Text style={styles.time}>{shift.startTime} - {shift.endTime}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
        {shift.remark && <Text style={styles.remark}>📌 {shift.remark}</Text>}
      </View>

      {currentShift && selectedShiftId && modalType && (
        <ShiftActionsModal
          visible={isModalOpen}
          modalView={modalType}
          currentShift={currentShift}
          isMyShift={true}
          remarkText={currentShift.remark || ''}
          modalDate={formattedDate}
          modalTimes={`${currentShift.startTime} - ${currentShift.endTime}`}
          remarkTitle={currentShift.post.title}
          guardTasks={tasksForShift}
          onClose={() => {
            setModalOpen(false);
            setSelectedShiftId(null);
            setModalType(null);
          }}
        />
      )}

    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { position: 'relative', flexDirection: 'row-reverse', gap: 4, padding: 14, paddingLeft: 28, borderRadius: 20, marginVertical: 6, borderWidth: 1, borderColor: '#ddd', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  title: { fontSize: 16, fontWeight: '600', color: '#222' },
  time: { fontSize: 14, fontWeight: '500', color: '#555' },
  date: { marginTop: 4, fontSize: 13, color: '#666' },
  remark: { marginTop: 8, fontSize: 13, textAlign: 'right', color: '#444', backgroundColor: '#f3f3f3', padding: 6, borderRadius: 6 },
  dropdown: { position: 'absolute', top: -12, right: 36, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, zIndex: 100 },
  menuItem: { paddingVertical: 6, paddingHorizontal: 12 },
});
