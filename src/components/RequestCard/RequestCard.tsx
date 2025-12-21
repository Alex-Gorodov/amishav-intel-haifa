import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { StatusLabels } from "../../constants/StatusLabels";
import { GiveRequestWithShift, RequestStatus, SwapRequestWithShifts } from "../../types/Request";
import { Colors } from "../../constants";

interface RequestCardProps {
  req: GiveRequestWithShift | SwapRequestWithShifts;
  isReceived: boolean;
  usersMap: Record<string, any>;
  onConfirm?: (req: any) => void;
  onReject?: (req: any) => void;
  onDelete?: (req: any) => void;
}

export const RequestCard = ({
  req,
  isReceived,
  usersMap,
  onConfirm,
  onReject,
  onDelete,
}: RequestCardProps) => {
  const firstUser = usersMap[0];
  const secondUser = usersMap[1];

  const isSwap = req.type === 'swap';

  return (
    <View style={styles.card}>

      {/* Пользователи и иконка */}
      <View style={{ alignItems: 'center', gap: 8, flexDirection: 'row-reverse', justifyContent: 'center' }}>
        <Text style={[styles.text, { fontWeight: '600' }]}>
          {firstUser ? `${firstUser.firstName} ${firstUser.secondName}` : 'לא ידוע'}
        </Text>

        <Ionicons
          name={isSwap ? "swap-horizontal-outline" : "arrow-back-outline"}
          size={28}
        />

        <Text style={[styles.text, { fontWeight: '600' }]}>
          {secondUser ? `${secondUser.firstName} ${secondUser.secondName}` : 'לא ידוע'}
        </Text>
      </View>

      {isSwap ? (
        <View style={{ marginTop: 8 }}>
          <View>
            <Text style={[styles.text, { fontWeight: '600' }]}>
              {req.fromShift?.post?.title || 'לא ידוע'}
            </Text>
            <Text style={styles.text}>
              {req.fromShift?.date?.toDate().toLocaleDateString('he-IL')}
            </Text>
          </View>
          <View>
            <Text style={[styles.text, { fontWeight: '600' }]}>
              {/* {secondUser ? `${secondUser.firstName} ${secondUser.secondName}` : 'לא ידוע'} */}
              {req.toShift?.post?.title || 'לא ידוע'}
            </Text>
            {/* <Text style={styles.text}>
            </Text> */}
            <Text style={styles.text}>
              {req.toShift?.date?.toDate().toLocaleDateString('he-IL')}
            </Text>
          </View>
        </View>
      ) : (
        <View style={{ marginTop: 8 }}>
          <Text style={[styles.text, { fontWeight: '600' }]}>
            {req.fromShift?.post?.title || 'לא ידוע'}
          </Text>
          <Text style={styles.text}>
            {req.fromShift?.date?.toDate().toLocaleDateString('he-IL')}
          </Text>
        </View>
      )}

      <Text style={styles.text}>
        סטטוס: {StatusLabels[req.status]}
      </Text>

      {(isReceived && req.status !== RequestStatus.Rejected) && (
        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={() => onConfirm?.(req)}
            style={[styles.button, { backgroundColor: Colors.progressBarValid }]}
          >
            <Text style={styles.buttonText}>אשר</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onReject?.(req)}
            style={[styles.button, { backgroundColor: Colors.progressBarInvalid }]}
          >
            <Text style={styles.buttonText}>סרב</Text>
          </TouchableOpacity>

        </View>
      )}
      {req.status === RequestStatus.Rejected && (
        <TouchableOpacity
          onPress={() => onDelete?.(req)}
          style={[styles.button, { backgroundColor: Colors.progressBarInvalid }]}
        >
          <Ionicons name="trash-outline" size={24} color="white" style={{textAlign: 'center'}} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: Colors.mainDark,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: '600',
  },
});
