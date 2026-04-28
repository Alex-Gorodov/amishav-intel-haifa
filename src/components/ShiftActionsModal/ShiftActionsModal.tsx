import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Modal, TouchableWithoutFeedback, ScrollView, Pressable, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { GuardTask } from '../../types/GuardTask';
import { Colors, SCREEN_HEIGHT } from '../../constants';
import CustomButton from '../CustomButton/CustomButton';
import CancelButton from '../CancelButton/CancelButton';
import { ModalView, useShiftRequestModal } from '../../hooks/useShiftRequestModal';
import { useShiftRequestActions } from '../../hooks/useShiftRequestActions';
import { useSelector } from 'react-redux';
import { State } from '../../types/State';
import { getRoleByPost } from '../../utils/getRoleByPost';
import useUser from '../../hooks/useUser';
import { Shift } from '../../types/Shift';
import { GlobalStyles } from '../../constants/GlobalStyles';
import { Roles } from '../../constants/Roles';
import { getRoleLabel } from '../../utils/getRoleLabel';
import CloseButton from '../CloseButton/CloseButton';
import { User } from '../../types/User';
import { getAvailableUsersByPost } from '../../utils/getAvailablePostsByRole';

interface ShiftActionsModalProps {
  visible: boolean;
  isMyShift: boolean;
  currentShift: Shift;
  remarkText: string;
  modalDate: string;
  modalView: ModalView;
  modalTimes: string;
  remarkTitle: string;
  guardTasks: GuardTask[];
  onClose: () => void;
}

export default function ShiftActionsModal({visible, currentShift, isMyShift, remarkText, modalDate, modalTimes, remarkTitle, guardTasks, onClose}: ShiftActionsModalProps) {
  const users = useSelector((state: State) => state.data.users);
  const user = useUser();

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

  const { swapShift, giveShift } = useShiftRequestActions();

  const handleSwap = () => {
    swapShift({
      currentShift,
      chosenShift,
      secondUserId,
      onSuccess: () => {
        setSelectedShiftId(null);
        onClose();
      },
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

  // const relevantShiftsToSwap = useMemo(() => {
  //   if (!users || !currentShift) return [];

  //   const myRole = getRoleByPost(currentShift.post.id);
  //   if (!myRole) return [];

  //   return users
  //     .filter(u => u.id !== user?.id)
  //     .flatMap(u =>
  //       (u.shifts || [])
  //         .filter(s => getRoleByPost(s.post.id) === myRole)
  //         .map(s => ({
  //           shift: s,
  //           owner: u,
  //         }))
  //     )
  //     .sort((a, b) => {
  //       const aDate = a.shift.date.toDate().getTime();
  //       const bDate = b.shift.date.toDate().getTime();
  //       return aDate - bDate;
  //     });
  // }, [users, currentShift]);


  const now = new Date();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const canSwap = (userA: User, userB: User, shiftA: Shift, shiftB: Shift) => {
    // same user ❌
    if (userA.id === userB.id) return false;

    // A must be able to work B's shift
    const aCanTakeB =
      getAvailableUsersByPost([userA], shiftB.post.id).length > 0;

    // B must be able to work A's shift
    const bCanTakeA =
      getAvailableUsersByPost([userB], shiftA.post.id).length > 0;

    return aCanTakeB && bCanTakeA;
  };

  const availableShifts = useMemo(() => {
    const start = startOfWeek;
    const end = endOfWeek;

    return users.flatMap(user => {
      return (user.shifts || [])
        .filter(targetShift => {
          if (!targetShift?.date) return false;

          const targetDate =
            "toDate" in targetShift.date
              ? targetShift.date.toDate()
              : new Date(targetShift.date);

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
      const dateA =
        "toDate" in a.date ? a.date.toDate() : new Date(a.date);

      const dateB =
        "toDate" in b.date ? b.date.toDate() : new Date(b.date);

      return dateA.getTime() - dateB.getTime();
    });
  }, [users, currentShift, startOfWeek, endOfWeek]);

  const groupedShifts = useMemo(() => {
  if (!availableShifts) return {};

  return availableShifts.reduce((acc, item) => {
    const date =
      "toDate" in item.date
        ? item.date.toDate()
        : new Date(item.date);

    const dateStr = date.toLocaleDateString("he-IL");

    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(item);

    return acc;
  }, {} as Record<string, typeof availableShifts>);
}, [availableShifts]);


  const relevantUsersToGive = useMemo(() => {
    if (!users || !currentShift) return [];

    const myRole = getRoleByPost(currentShift.post.id);
    if (!myRole) return [];

    return users.filter(u => {
      if (u.id === user?.id) return false;

      return (u.shifts || []).some(
        s => getRoleByPost(s.post.id) === myRole
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
      return Object.keys(groupedShifts).length
        ? SCREEN_HEIGHT * 0.675
        : SCREEN_HEIGHT * 0.25;
    }

    if (isGiveView) {
      return relevantUsersToGive.length !== 0
        ? SCREEN_HEIGHT * 0.63
        : SCREEN_HEIGHT * 0.25;
    }

    return SCREEN_HEIGHT * 0.5;
  }, [modalView, groupedShifts, isMyShift]);

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
                    guardTasks.length !== 0 &&
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
                    relevantUsersToGive.length !== 0
                    ? (
                      <ScrollView
                        style={[styles.modalShiftsList, {height: SCREEN_HEIGHT - 430}]}
                      >
                        {relevantUsersToGive.map(u => {
                          const isSelected = selectedShiftId === u.id;

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
                    Object.entries(groupedShifts).length !== 0
                    ?
                    <ScrollView style={[styles.modalShiftsList, {height: SCREEN_HEIGHT - 430}]}>
                      {Object.entries(groupedShifts).map(([date, shifts]) => (
                        <View
                          key={date}
                          style={{ marginBottom: 8 }}
                        >
                          <Text style={{ fontSize: 16, fontWeight: 600, textAlign: 'center', marginBottom: 8 }}>
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
    borderWidth: 1,
    padding: 8,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: 'inset 0px -4px 10px 0px rgba(0,0,0,0.4)',

  },
});
