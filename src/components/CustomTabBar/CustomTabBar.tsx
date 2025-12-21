import { StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../../constants';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();


  return (
    <View style={[styles.container, {
      left: insets.left + 8,
      right: insets.right + 8,
    }]}>
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
            style={styles.tab}
            hitSlop={{ top: 12, bottom: 12, left: 0, right: 12 }}
          >
            {icon}
          </TouchableOpacity>

        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: Colors.mainLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    position: 'absolute',
    bottom: 12,
    boxShadow: '0px 0px 8px 2px rgba(0,0,0,0.4)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    paddingBottom: 0,
    alignItems: 'center',
    overflow: 'hidden'
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
