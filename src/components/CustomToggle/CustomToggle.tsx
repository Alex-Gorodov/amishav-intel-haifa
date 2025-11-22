import React, { useEffect, useRef, useState } from "react";
import { Text, Animated, StyleSheet, Pressable, View, StyleProp, ViewStyle } from "react-native";
import { Colors } from "../../constants";

interface SimpleToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  leftLabel?: string | React.ReactNode;
  rightLabel?: string | React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const SimpleToggle = ({ value, onChange, leftLabel = "On", rightLabel = "Off", style }: SimpleToggleProps) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const [width, setWidth] = useState(300);
  const HALF = width / 2;

  useEffect(() => {
    anim.setValue(value ? 1 : 0);
  }, [value]);

  const toggle = () => {
    const next = !value;
    Animated.timing(anim, {
      toValue: next ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start(() => onChange(next));
  };

  return (
    <Pressable
      style={[styles.wrap, style]}
      onPress={toggle}
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          styles.slider,
          {
            width: HALF - 6,
            transform: [
              {
                translateX: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, HALF],
                })
              }
            ]
          }
        ]}
      />

      <View style={styles.item}>
        <Text style={[styles.text, value && styles.textActive]}>{leftLabel}</Text>
      </View>
      <View style={styles.item}>
        <Text style={[styles.text, !value && styles.textActive]}>{rightLabel}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    height: 44,
    borderRadius: 22,
    flexDirection: "row",
    backgroundColor: "#e6e6e6",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.black,
  },
  slider: {
    position: "absolute",
    top: 1,
    left: 1,
    height: 38,
    borderRadius: 20,
    backgroundColor: Colors.black,
  },
  item: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "600",
    fontSize: 16,
    color: "#fff",
  },
  textActive: {
    color: "#000",
  },
});
