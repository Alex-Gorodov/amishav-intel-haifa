import React, { ReactNode, useRef, useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  height?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export default function FlipCard({
  front,
  back,
  height = 90,
  duration = 250,
  style,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.timing(translateY, {
      toValue: flipped ? 0 : -height,
      duration,
      useNativeDriver: true,
    }).start(() => setFlipped(!flipped));
  };

  return (
    <Pressable onPress={toggle} style={[styles.container, style, { height }]}>
      <Animated.View
        style={[
          styles.inner,
          { height: height * 2, transform: [{ translateY }] },
        ]}
      >
        <View style={[styles.face, { height }]}>{front}</View>
        <View style={[styles.back, { height }]}>{back}</View>
      </Animated.View>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: Colors.mainLight,
  },
  inner: {
    width: '100%',
  },
  face: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  back: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60
  },
  text: {
    fontSize: 32,
    fontWeight: 600,
    color: Colors.mainDark
  }
});
