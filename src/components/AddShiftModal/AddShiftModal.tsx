import { Modal, View, Text, Pressable, StyleSheet, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { ErrorMessages, SuccessMessages } from "../../constants/Messages";
import { Timestamp, arrayUnion, doc, setDoc } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { fetchUsers } from "../../store/api/fetchUsers.api";
import { setError, setSuccess } from "../../store/actions";
import CustomButton from "../CustomButton/CustomButton";
import CancelButton from "../CancelButton/CancelButton";
import { db } from "../../services/firebaseConfig";
import TimePicker from "../TimePicker/TimePicker";
import { Posts } from "../../constants/Posts";
import { useDispatch } from "react-redux";
import { Colors } from "../../constants";
import React, { useState } from "react";

interface Props {
  isOpened: boolean;
  onClose: () => void;
  userId: string;
}

export default function AddShiftModal({ isOpened, onClose, userId }: Props) {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  const [focusRemark, setFocusRemark] = useState(false)

  const dispatch = useDispatch();

  const resetForm = () => {
    setSelectedPost(null);
    setDate(new Date());
    setStartTime("");
    setEndTime("");
    setRemark("");
  };

  const handlePostSelect = (postId: string) => {
    setSelectedPost(postId);
    const post = Posts.find(p => p.id === postId);
    setStartTime(post?.defaultStartTime || "");
    setEndTime(post?.defaultEndTime || "");
  };

  function validateShift(start: string, end: string) {
    const errors: string[] = [];

    if (!start) errors.push(ErrorMessages.START_TIME_NOT_SELECTED);
    if (!end) errors.push(ErrorMessages.END_TIME_NOT_SELECTED);

    if (start && end) {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);

      const startMin = sh * 60 + sm;
      let endMin = eh * 60 + em;

      const isNightShift = sh >= 18 || sh < 6;

      if (endMin < startMin && !isNightShift) {
        errors.push(ErrorMessages.END_BEFORE_START_DAY);
      }

      if (endMin < startMin && isNightShift) {
        endMin += 24 * 60;
      }

      const duration = endMin - startMin;

      if (duration > 12 * 60) errors.push(ErrorMessages.SHIFT_TOO_LONG);
    }

    return errors;
  };

  const handleEndTimeChange = (newEnd: string | null) => {
    if (!newEnd) return;
    setEndTime(newEnd);
  };

  const handleSave = async () => {
    if (!selectedPost) {
      dispatch(setError({message: (ErrorMessages.POST_NOT_SELECTED)}));
      return;
    }

    const errors = validateShift(startTime, endTime);
    if (errors.length > 0) {
      dispatch(setError({message: (`${errors.join("\n")}שגיעות! `)}));
      return;
    }

    if (!userId) {
      dispatch(setError({message: (ErrorMessages.USER_NOT_SELECTED)}));
      return;
    }

    setLoading(true);

    const post = Posts.find(p => p.id === selectedPost);
    if (!post) {
      setLoading(false);
      return;
    }

    const dateToSet = new Date(date);

    const newShift = {
      id: `${dateToSet.getTime()}_${post.id}`,
      date: Timestamp.fromDate(dateToSet),
      post,
      startTime,
      endTime,
      remark,
    };

    try {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { shifts: arrayUnion(newShift) }, { merge: true });

      resetForm();

      await fetchUsers(dispatch);
      dispatch(setSuccess({ message: SuccessMessages.SHIFT_ADDED}));
      onClose();
    } catch (err) {
      dispatch(setError({ message: ErrorMessages.SHIFT_SAVE_ERROR }));
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal transparent visible={isOpened} animationType="fade">
      <Pressable style={styles.backdrop} onPress={closeModal}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>

          <Text style={styles.title}>הוספת משמרת</Text>

          <DateTimePicker
            value={date}
            textColor={Colors.mainDark}
            style={styles.datePicker}
            locale="he-IL"
            accentColor={Colors.primary}
            onChange={(e, newDate) => newDate && setDate(newDate)}
          />

          <ScrollView style={styles.postsList}>
            {Posts.map(p => (
              <Pressable
                key={p.id}
                style={[
                  styles.postItem,
                  selectedPost === p.id && styles.postItemSelected
                ]}
                onPress={() => handlePostSelect(p.id)}
              >
                <Text style={{textAlign: 'right'}}>{p.title}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.timeRow}>
            <TimePicker
              value={endTime}
              title="בחר זמן הסיום"
              onChange={t => handleEndTimeChange(t)}
            />

            <TimePicker
              value={startTime}
              title="בחר זמן ההתחלה"
              onChange={t => setStartTime(t ?? "")}
            />
          </View>

          <Text style={styles.label}>הערות (אופציונלי)</Text>
          <TextInput
            placeholder="הערות..."
            placeholderTextColor={Colors.placeholder}
            style={[styles.input, {borderColor: focusRemark ? Colors.mainDark : Colors.mainLight}]}
            value={remark}
            onChangeText={setRemark}
            onFocus={() => setFocusRemark(true)}
            onBlur={() => setFocusRemark(false)}
          />

          <View style={styles.actions}>
            <CustomButton
              onHandle={handleSave}
              title={
                loading ? <ActivityIndicator size="small" /> : <Text>הוסף משמרת</Text>
              }
            />

            <CancelButton onHandle={closeModal}/>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 8,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    gap: 8
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 12
  },
  postsList: {
    maxHeight: 200,
    borderWidth: 1,
    padding: 8,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: 'inset 0px -4px 10px 0px rgba(0,0,0,0.4)',
  },
  postItem: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 6
  },
  postItemSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary
  },
  datePickerWrapper: {
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  datePicker: { marginLeft: -20 },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right"
  },
  input: { borderWidth: 2, padding: 10, borderRadius: 16, textAlign: 'right' },
  actions: { gap: 8 },
});
