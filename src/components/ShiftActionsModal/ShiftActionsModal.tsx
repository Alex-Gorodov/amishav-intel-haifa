import { View, Text, Modal, TouchableWithoutFeedback, ScrollView, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GuardTask } from '../../types/GuardTask';
import { Colors, SCREEN_HEIGHT } from '../../constants';
import CustomButton from '../CustomButton/CustomButton';
import CancelButton from '../CancelButton/CancelButton';
import { ModalView, useShiftRequestModal } from '../../hooks/useShiftRequestModal';
import { useShiftRequestActions } from '../../hooks/useShiftRequestActions';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../../types/State';
import { getRoleByPost } from '../../utils/getRoleByPost';
import useUser from '../../hooks/useUser';
import { Shift } from '../../types/Shift';
import { GlobalStyles } from '../../constants/GlobalStyles';
import { getRoleLabel } from '../../utils/getRoleLabel';
import CloseButton from '../CloseButton/CloseButton';
import { User } from '../../types/User';
import { getAvailableUsersByPost } from '../../utils/getAvailablePostsByRole';
import { parseShiftDate } from '../../utils/parseShiftDate';
import { Post } from '../../types/Post';
import { ALL_POSTS } from '../../constants/Posts';
import { normalizeDate } from '../../utils/getCurrentWeekDates';
import { setError } from '../../store/actions';

interface ShiftActionsModalProps {
  visible: boolean;
  isMyShift: boolean;
  currentShift: Shift;
  remarkText: string;
  modalDate: string;
  modalView: ModalView;
  modalTimes: string;
  scheduleType?: string;
  remarkTitle: string;
  guardTasks: GuardTask[];
  onClose: () => void;
}

export default function ShiftActionsModal({visible, scheduleType,currentShift, isMyShift, remarkText, modalDate, modalTimes, remarkTitle, guardTasks, onClose}: ShiftActionsModalProps) {
  const users = useSelector((state: State) => state.data.users);
  const user = useUser();
  const dispatch = useDispatch();

  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [secondUserId, setSecondUserId] = useState<string | null>(null);

  const animatedHeight = useRef(new Animated.Value(SCREEN_HEIGHT * 0.5)).current; // начальная высота 50%

  const {
    chosenShift,
    setChosenShift,
    modalView,
    openSwap,
    openGive,
    openDetails,
  } = useShiftRequestModal();

  const weekRange = useMemo(() => {
    const baseDate = currentShift?.date
      ? normalizeDate(currentShift.date)
      : new Date();

    const start = new Date(baseDate);
    start.setDate(baseDate.getDate() - baseDate.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return { start, end };
  }, [currentShift?.date]);

  const handleOpenSwapShift = () => {
    openSwap();
  }

  const handleOpenGiveShift = () => {
    openGive();
  }

  const handleCancel = () => {
    openDetails();
    setSelectedShiftId(null);
    setSecondUserId(null);
  };

  const isDetailsView = modalView === 'details';
  const isSwapView = modalView === 'swap';
  const isGiveView = modalView === 'give';

  const securityPosts = useSelector((state: any) => state.data.securityPosts);
  const occPosts = useSelector((state: any) => state.data.controllCenterPosts);
  const dertPosts = useSelector((state: any) => state.data.dertPosts);

  const contextPosts: Post[] = useMemo(() => {
    let selectedSlice: Post[] = [];

    switch (scheduleType?.toLowerCase()) {
      case 'security':
        selectedSlice = securityPosts;
        break;
      case 'occ':
      case 'controllcenter':
        selectedSlice = occPosts;
        break;
      case 'dert':
        selectedSlice = dertPosts;
        break;
      default:
        selectedSlice = [];
    }

    if (!selectedSlice || selectedSlice.length === 0) {
      return ALL_POSTS;
    }

    return selectedSlice;
  }, [scheduleType, securityPosts, occPosts, dertPosts]);

  const { swapShift, giveShift } = useShiftRequestActions();

  const canSwap = (userA: User, userB: User, shiftA: Shift, shiftB: Shift) => {
    // same user ❌
    if (userA.id === userB.id) return false;

    // A must be able to work B's shift
    const aCanTakeB =
      getAvailableUsersByPost([userA], shiftB.post.id, contextPosts)?.length > 0;

    // B must be able to work A's shift
    const bCanTakeA =
      getAvailableUsersByPost([userB], shiftA.post.id, contextPosts)?.length > 0;

    return aCanTakeB && bCanTakeA;
  };

  const handleSwap = () => {
    const targetUser = users.find(u => u.id === secondUserId);
    const currentUser = users.find(u => u.id === currentShift.userId);

    if (!targetUser || !currentUser || !chosenShift) return;

    const ok = canSwap(
      currentUser,
      targetUser,
      currentShift,
      chosenShift
    );

    if (!ok) {
      dispatch(setError({ message: 'לא ניתן להחליף משמרות אלו' }));
      return;
    }

    swapShift({
      currentShift,
      chosenShift,
      secondUserId,
    });
  };

  const handleGive = () => {
    giveShift({
      currentShift,
      secondUserId,
      onSuccess: () => {
        setSelectedShiftId(null);
        onClose();
      }
    })
  }

  const now = new Date();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

//   console.log("SHIFT CHECK SAMPLE:", users.flatMap(u =>
//   (u.shifts || []).map(s => ({
//     id: s.id,
//     raw: s.date,
//     normalized: normalizeDate(s.date),
//   }))
// ));

const canSeeShift = (shift: Shift, user: User) => {
  const role = getRoleByPost(shift.post.id, contextPosts);
  if (!role) return false;

  const userRoles = user.roles || [];

  // user must have this role
  return userRoles.includes(role);
};

  const availableShifts = useMemo(() => {
    const { start, end } = weekRange;

    return users.flatMap(user => {
      return (user.shifts || [])
        .filter(targetShift => {
          if (!targetShift?.date) return false;

          const targetDate = normalizeDate(targetShift.date);

          const inWeek = targetDate >= start && targetDate < end;

          if (!inWeek) return false;

          if (user.id === currentShift.userId && targetShift.id === currentShift.id) return false;

          const ok = canSwap(
            users.find(u => u.id === currentShift.userId)!,
            user,
            currentShift,
            targetShift
          );

          return ok;
        })
        .map(targetShift => ({
          ...targetShift,
          user,
        }));
    })
    .sort((a, b) => {
      const dateA = normalizeDate(a.date);
      const dateB = normalizeDate(b.date);

      return dateA.getTime() - dateB.getTime();
    });
  }, [users, currentShift, startOfWeek, endOfWeek]);

  const groupedShifts = useMemo(() => {
    const grouped: Record<string, typeof availableShifts> = {};

    for (const s of availableShifts) {
      const date = normalizeDate(s.date);
      const key = date.toISOString().split("T")[0];

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    }

    // sort each group separately
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
    });

    return grouped;
  }, [availableShifts]);

  const relevantUsersToGive = useMemo(() => {
    if (!users || !currentShift) return [];

    const myRole = getRoleByPost(currentShift.post.id, contextPosts);
    if (!myRole) return [];

    return users.filter(u => {
      if (u.id === user?.id) return false;

      return (u.shifts || []).some(
        s => getRoleByPost(s.post.id, contextPosts) === myRole
      );
    });
  }, [users, currentShift, user]);


  const targetHeight = useMemo(() => {
    if (!isMyShift) {
      return SCREEN_HEIGHT * 0.45;
    }

    if (isDetailsView) {
      return SCREEN_HEIGHT * 0.5;
    }

    if (isSwapView) {
      return Object.keys(groupedShifts || {})?.length > 0
        ? SCREEN_HEIGHT * 0.7
        : SCREEN_HEIGHT * 0.25;
    }

    if (isGiveView) {
      return (relevantUsersToGive || [])?.length > 0
        ? SCREEN_HEIGHT * 0.7
        : SCREEN_HEIGHT * 0.25;
    }

    return SCREEN_HEIGHT * 0.5;
  }, [
    modalView,
    groupedShifts,
    relevantUsersToGive,
    isMyShift,
    isDetailsView,
    isSwapView,
    isGiveView,
  ]);

  useEffect(() => {
    if (!visible) return;

    Animated.timing(animatedHeight, {
      toValue: targetHeight,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [targetHeight, visible]);


  useEffect(() => {
    if (!visible) {
      animatedHeight.setValue(SCREEN_HEIGHT * 0.5);
    }
  }, [visible]);


  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', alignItems: 'center' }}>
          <TouchableWithoutFeedback>

            <Animated.View
              style={{
                width: '100%',
                height: isMyShift ? animatedHeight : SCREEN_HEIGHT * 0.45,
                backgroundColor: Colors.white,
                padding: 16,
                borderRadius: 12,
              }}
            >
              {
                isDetailsView &&
                <View>
                  <View style={{flexDirection: 'column', marginBottom: 16}}>
                    <Text style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, textAlign: 'right' }}>{remarkTitle}</Text>
                    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                      <Text style={{textAlign: 'right'}}>{modalTimes}</Text>
                      <Text style={{textAlign: 'right'}}>{modalDate}, </Text>
                    </View>
                  </View>

                  {
                    guardTasks?.length !== 0 &&
                    <View>
                      <Text style={{ fontWeight: 600, marginBottom: 8, textAlign: 'right' }}>
                        מסימות:
                      </Text>
                      {guardTasks
                        .filter(t => t.postId.includes("night") || !t.postId.includes("night"))
                        .sort((a, b) => {
                          if (a.postId.includes("night")) return 0;
                          const aStart = a.time.split('-')[0];
                          const bStart = b.time.split('-')[0];

                          return aStart.localeCompare(bStart);
                        })
                        .map((task, i) => (
                          <View style={{ marginBottom: 8 }} key={i}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginBottom: -4 }}>
                              <Text>{task.location}</Text>
                              <Text>{task.time}</Text>
                            </View>
                            {task.remark && (
                              <Text style={{ textAlign: 'right', fontSize: 12, color: '#898989' }}>{task.remark}</Text>
                            )}
                          </View>
                        ))
                      }
                    </View>
                  }

                  <Text style={{ marginBottom: 12, textAlign: 'right' }}>{remarkText}</Text>
                  {
                    !isMyShift && <CloseButton onHandle={onClose}/>
                  }
                </View>
              }

              {isGiveView && (
                <View style={{ width: '100%' }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 8,
                      textAlign: 'center',
                    }}
                  >
                    תבחר למי למסור
                  </Text>

                  {
                    (relevantUsersToGive ?? []).length > 0
                    ? (
                      <ScrollView
                        style={[styles.modalShiftsList, {height: SCREEN_HEIGHT - 430}]}
                      >
                        {relevantUsersToGive.map(u => {
                          const isSelected = secondUserId === u.id;

                          return (
                            <Pressable
                              key={u.id}
                              onPress={() =>
                                setSecondUserId(isSelected ? null : u.id)
                              }
                              style={{
                                padding: 8,
                                borderWidth: 2,
                                borderRadius: 8,
                                marginBottom: 8,
                                borderColor: isSelected ? '#007AFF' : '#eee',
                                backgroundColor: isSelected ? '#E6F0FF' : Colors.white,
                              }}
                            >
                              <Text style={{ textAlign: 'right' }}>
                                {u.firstName} {u.secondName}
                              </Text>

                              <Text
                                style={{
                                  textAlign: 'right',
                                  fontSize: 12,
                                  color: '#666',
                                }}
                              >
                                {
                                  getRoleLabel(u.roles[0])
                                }
                              </Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    )
                    : (
                      <Text style={GlobalStyles.emptyMessage}>
                        אין למי למסור משמרת
                      </Text>
                    )
                  }
                </View>
              )}


              {isSwapView && (
                <View style={{ width: '100%' }}>

                  <Text style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, textAlign: 'center', paddingBottom: 8 }}>
                    בחר משמרת איתה תרצה להתחלף
                  </Text>
                  {
                    Object.entries(groupedShifts)?.length !== 0
                    ?
                    <ScrollView
                      style={[styles.modalShiftsList, {height: SCREEN_HEIGHT - 430}]}
                      contentContainerStyle={{ padding: 8 }}
                    >
                      {Object.entries(groupedShifts).map(([date, shifts]) => (
                        <View
                          key={date}
                          style={{ gap: 8 }}
                        >
                          <Text style={{ fontSize: 16, fontWeight: 600, textAlign: 'center', marginTop: 8 }}>
                            {date}
                          </Text>

                          {shifts.map((item) => {
                            const isSelected = selectedShiftId === item.id;

                            return (
                              <Pressable
                                key={item.id}
                                onPress={() => {
                                  setSecondUserId(item.user.id);
                                  setChosenShift(item);
                                  selectedShiftId !== item.id ? setSelectedShiftId(item.id) : setSelectedShiftId(null)
                                }}
                                style={{
                                  padding: 8,
                                  borderWidth: 2,
                                  borderRadius: 8,
                                  borderColor: isSelected ? '#007AFF' : '#eee',
                                  backgroundColor: isSelected ? '#E6F0FF' : Colors.white,
                                }}
                              >
                                <Text style={{ textAlign: 'right' }}>
                                  {item.user.firstName} {item.user.secondName}
                                </Text>
                                <Text style={{ textAlign: 'right' }}>{item.post.title}</Text>
                                <Text style={{ textAlign: 'right' }}>
                                  {item.startTime} - {item.endTime}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      ))}
                    </ScrollView>
                    :
                    <Text style={GlobalStyles.emptyMessage}>אין אפשרויות לחילוף</Text>
                  }
                </View>
              )}

              {
                isMyShift && (
                  <View
                    style={{
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingBottom: 20,
                    }}
                  >
                    {/* DETAILS */}
                    {isDetailsView && (
                      <View style={{gap: 8}}>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <CustomButton
                            invertColors
                            title="למסור משמרת"
                            onHandle={handleOpenGiveShift}
                            style={{ width: '50%' }}
                          />
                          <CustomButton
                            invertColors
                            title="להחליף משמרת"
                            onHandle={handleOpenSwapShift}
                            style={{ width: '50%' }}
                          />
                        </View>
                      </View>
                    )}

                    {/* SWAP */}
                    {isSwapView && selectedShiftId && (
                      <CustomButton
                        invertColors
                        title="להחליף משמרת"
                        onHandle={handleSwap}
                        style={{ width: '50%' }}
                      />
                    )}

                    {/* GIVE */}
                    {isGiveView && secondUserId && (
                      <CustomButton
                        invertColors
                        title="למסור משמרת"
                        onHandle={handleGive}
                        style={{ width: '50%' }}
                      />
                    )}

                    {/* CANCEL / CLOSE */}
                    {
                      modalView !== 'details' ? (
                        <CancelButton onHandle={handleCancel} />
                      ) : (
                        <CloseButton onHandle={onClose}/>
                      )}
                  </View>
                )
              }

            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalShiftsList: {
    borderWidth: 0.4,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: 'inset 0px -4px 10px 0px rgba(0,0,0,0.4)',
  },
});
