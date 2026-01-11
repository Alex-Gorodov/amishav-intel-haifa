import { StyleSheet, TouchableOpacity, View, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../../constants';
import { BlurView } from 'expo-blur';
import React, { useRef, useEffect } from 'react';

const { width } = Dimensions.get('window');

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const indicator = useRef(new Animated.Value(0)).current;

  const tabWidth = (width - (insets.left + insets.right) - 16) / state.routes.length; // 8 px padding слева и справа

  useEffect(() => {
    Animated.spring(indicator, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      damping: 15,
      stiffness: 150,
      mass: 1,
    }).start();
  }, [state.index, tabWidth]);

  return (
  <View style={styles.shadowWrapper}>
    <BlurView intensity={60} tint="light" style={styles.blurContainer}>
      {/* Animated indicator */}
      <Animated.View
        style={{
          position: 'absolute',
          width: tabWidth * 0.75,
          height: 48,
          borderRadius: 100,
          backgroundColor: 'rgba(214, 214, 214, 0.7)',
          top: 6,
          left: tabWidth * 0.125,
          transform: [{ translateX: indicator }],
        }}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const icon = options.tabBarIcon
          ? options.tabBarIcon({
              focused: isFocused,
              color: isFocused ? Colors.mainDark : Colors.unfocusedTabBarButton,
              size: 24,
            })
          : null;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={styles.tabWrapper}
            hitSlop={{ top: 12, bottom: 12, left: 0, right: 12 }}
          >
            {icon}
          </TouchableOpacity>
        );
      })}
    </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 8,
    right: 8,
    height: 60,
    borderRadius: 36,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  blurContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: 'rgba(228, 228, 228, 0.6)',
  },
  container: {
    flexDirection: 'row',
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    position: 'absolute',
    bottom: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(228, 228, 228, 0.6)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  tabWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    height: '100%',
  },
});
