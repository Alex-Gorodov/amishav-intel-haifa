import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react'
import { Colors } from '../../constants';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          if (!isFocused) navigation.navigate(route.name);
        };

        const icon = options.tabBarIcon
          ? options.tabBarIcon({
              focused: isFocused,
              color: isFocused ? Colors.black : '#999',
              size: 24,
            })
          : null;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
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
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 5,
    position: 'absolute',
    left: 20,
    right: 20,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.3)',
    bottom: Platform.OS === 'ios' ? 16 : 8,
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
