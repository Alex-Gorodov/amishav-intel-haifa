import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  Text,
  Platform,
} from "react-native";
import CustomButton from "../CustomButton/CustomButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "../../constants";

interface TimePickerProps {
  value: string; // "HH:MM"
  title: string;
  onChange: (value: string) => void;
}

const pad = (n: number) => n.toString().padStart(2, "0");

const toDateFromHM = (hm?: string) => {
  if (!hm) return new Date();
  const [hh, mm] = hm.split(":").map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d;
};

const toHM = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const TimePicker: React.FC<TimePickerProps> = ({ value, title, onChange }) => {
  const [show, setShow] = useState(false);
  const [tempTime, setTempTime] = useState<string>(value || "");

  useEffect(() => {
    setTempTime(value || "");
  }, [value]);

  const open = () => {
    if (!value) {
      const now = new Date();
      const m = Math.round(now.getMinutes() / 5) * 5;
      now.setMinutes(m);
      setTempTime(toHM(now));
    } else {
      setTempTime(value);
    }
    setShow(true);
  };

  const handleChange = (_event: any, selectedDate?: Date) => {
    if (!selectedDate) {
      if (Platform.OS === "android") {
        setShow(false);
      }
      return;
    }

    const h = selectedDate.getHours();
    const m = selectedDate.getMinutes();
    setTempTime(`${pad(h)}:${pad(m)}`);
  };

  const handleSave = () => {
    if (tempTime) {
      onChange(tempTime);
    }
    setShow(false);
  };

  const pickerDate = toDateFromHM(tempTime);

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={open}
        style={{
          padding: 12,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 16,
        }}
      >
        <Text style={{ textAlign: "center" }}>{value || title}</Text>
      </TouchableOpacity>

      <Modal transparent visible={show} animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShow(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#eee",
              padding:16,
              borderRadius: 16,
            }}
          >
            <Text style={{textAlign: 'center', fontSize: 24}}>{title}</Text>
            <DateTimePicker
              value={pickerDate}
              mode="time"
              minuteInterval={5}
              is24Hour={true}
              display="spinner"
              onChange={handleChange}
              textColor={Colors.mainDark}
            />

            <CustomButton onHandle={handleSave} title="שמור"
            // invertColors
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default TimePicker;
