import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { View, Pressable, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import FlipCard from "../FlipCard/FlipCard";
import { Colors } from "../../constants";

interface SalaryCardProps {
  salary: string;
  style?: StyleProp<ViewStyle>;
}

export default function SalaryCard({ salary, style }: SalaryCardProps) {
  const [hidden, setHidden] = useState(false);

  const displayValue =
    salary === null
      ? '—'
      : hidden
        ? '*'.repeat(6)
        : `₪ ${salary}`;

  return (
    <FlipCard
      height={80}
      style={style}
      front={
        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <View style={{ justifyContent: 'center', height: 80 }}>
            {
              hidden
              ?
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {Array.from({ length: 6 }, (_, i) => (
                  <Ionicons key={i} name="medical-sharp" size={24} color={Colors.mainDark}/>
                ))}
              </View>
              :
              <Text style={styles.text}>{displayValue}</Text>
            }
          </View>

          <Pressable
            onPress={(e) => { e.stopPropagation(); setHidden(p => !p) }}
            style={[styles.eye]}
            hitSlop={4}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={26} />
          </Pressable>
        </View>

      }
      back={
        <Text style={styles.warning}>
          הנתונים על השכר משוערים בלבד ואין להסתמך עליהם באופן מלא.
        </Text>
      }
    />
  );
}


const styles = StyleSheet.create({
  text: {
    fontSize: 32,
    fontWeight: 600,
    color: Colors.mainDark,
    lineHeight: 80,
    textAlign: 'center',
  },
  eye: {
    position: 'absolute',
    top: 6,
    right: 12
  },
  warning: {
    textAlign: 'center',
    fontWeight: 600,
  }
});
