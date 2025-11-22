import { Modal, View, Text, Pressable, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import React, { useState } from "react";
import { Timestamp, arrayUnion, doc, setDoc } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Posts } from "../../constants/Posts";
import { db } from "../../services/firebaseConfig";
import { fetchUsers } from "../../store/api/fetch.api";
import { useDispatch } from "react-redux";

interface Props {
  isOpened: boolean;
  onClose: () => void;
  userId: string;
}

// export default function AddShiftModal({ isOpened, onClose, userId }: Props) {
//   const [selectedPost, setSelectedPost] = useState<string | null>(null);
//   const [date, setDate] = useState<Date>(new Date());
//   const [remark, setRemark] = useState<string>("");
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const dispatch = useDispatch();

//   const handleSave = async () => {
//     if (!selectedPost || !userId) return;

//     const post = Posts.find((p) => p.id === selectedPost);
//     if (!post) return;

//     const dateToSet = new Date(date);

//     if (post.defaultStartTime) {
//       const [hours, minutes] = post.defaultStartTime.split(":").map(Number);
//       dateToSet.setHours(hours);
//       dateToSet.setMinutes(minutes);
//       dateToSet.setSeconds(0);
//       dateToSet.setMilliseconds(0);
//     }

//     const newShift = {
//       date: Timestamp.fromDate(dateToSet),
//       post,
//       remark,
//     };

//     const userRef = doc(db, "users", userId);

//     await setDoc(
//       userRef,
//       { shifts: arrayUnion(newShift) },
//       { merge: true }
//     );

//     fetchUsers(dispatch);
//     onClose();
//   };

//   return (
//     <Modal transparent visible={isOpened} animationType="fade">
//       <View style={styles.backdrop}>
//         <View style={styles.modal}>
//           <Text style={styles.title}>הוספת משמרת</Text>

//           <Pressable onPress={() => setShowDatePicker(true)}>
//             <Text style={styles.field}>
//               תאריך: {date.toLocaleDateString("he-IL")}
//             </Text>
//           </Pressable>
//           {showDatePicker && (
//             <DateTimePicker
//               value={date}
//               mode="date"
//               onChange={(event, newDate) => {
//                 setShowDatePicker(false);
//                 if (newDate) setDate(newDate);
//               }}
//             />
//           )}

//           <ScrollView style={styles.postsList}>
//             {Posts.map((p) => (
//               <Pressable
//                 key={p.id}
//                 style={[
//                   styles.postItem,
//                   selectedPost === p.id && styles.postItemSelected,
//                 ]}
//                 onPress={() => setSelectedPost(p.id)}
//               >
//                 <Text>{p.title}</Text>
//               </Pressable>
//             ))}
//           </ScrollView>

//           <Text style={styles.label}>הערות (אופציונלי)</Text>
//           <TextInput
//             placeholder="הערות..."
//             style={styles.input}
//             value={remark}
//             onChangeText={setRemark}
//           />

//           {/* actions */}
//           <View style={styles.actions}>
//             <TouchableOpacity style={styles.button} onPress={handleSave}>
//               <Text style={styles.btnText}>שמור</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.button} onPress={onClose}>
//               <Text style={styles.btnText}>ביטול</Text>
//             </TouchableOpacity>
//           </View>

//         </View>
//       </View>
//     </Modal>
//   );
// }


export default function AddShiftModal({ isOpened, onClose, userId }: Props) {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [remark, setRemark] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dispatch = useDispatch();

  const handlePostSelect = (postId: string) => {
    setSelectedPost(postId);
    const post = Posts.find(p => p.id === postId);
    setStartTime(post?.defaultStartTime ?? "");
    setEndTime(post?.defaultEndTime ?? "");
  };

  const handleSave = async () => {
    if (!selectedPost || !userId) return;

    const post = Posts.find(p => p.id === selectedPost);
    if (!post) return;

    const dateToSet = new Date(date);

    // Сохраняем в Shift только время из полей (пользователь или дефолт)
    const newShift = {
      date: Timestamp.fromDate(dateToSet),
      post,
      startTime,
      endTime,
      remark,
    };

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { shifts: arrayUnion(newShift) }, { merge: true });

    fetchUsers(dispatch);
    onClose();
  };

  return (
    <Modal transparent visible={isOpened} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>הוספת משמרת</Text>

          {/* Выбор даты */}
          <Pressable onPress={() => setShowDatePicker(true)}>
            <Text style={styles.field}>תאריך: {date.toLocaleDateString("he-IL")}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(e, newDate) => { setShowDatePicker(false); if (newDate) setDate(newDate); }}
            />
          )}

          {/* Список постов */}
          <ScrollView style={styles.postsList}>
            {Posts.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.postItem, selectedPost === p.id && styles.postItemSelected]}
                onPress={() => handlePostSelect(p.id)}
              >
                <Text>{p.title}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Поля времени */}
          <TextInput
            placeholder="Start time (HH:MM)"
            style={styles.input}
            value={startTime}
            onChangeText={setStartTime}
          />
          <TextInput
            placeholder="End time (HH:MM)"
            style={styles.input}
            value={endTime}
            onChangeText={setEndTime}
          />

          {/* Комментарий */}
          <Text style={styles.label}>הערות (אופציונלי)</Text>
          <TextInput
            placeholder="הערות..."
            style={styles.input}
            value={remark}
            onChangeText={setRemark}
          />

          {/* Действия */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.btnText}>שמור</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.btnText}>ביטול</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  title: { fontSize: 18, textAlign: "center", marginBottom: 12 },
  field: { padding: 10, backgroundColor: "#eee", borderRadius: 8, marginBottom: 12 },
  postsList: { maxHeight: 200 },
  postItem: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 6,
  },
  postItemSelected: {
    backgroundColor: "#d0e8ff",
    borderColor: "#3fa0ff",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "right",
  },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  button: { padding: 10, backgroundColor: "#222", borderRadius: 8, flex: 1, marginHorizontal: 4 },
  btnText: { color: "white", textAlign: "center" },
});
