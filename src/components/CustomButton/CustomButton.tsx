import { Pressable, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import React, { ReactNode } from 'react';
import { Colors } from '../../constants';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/root-reducer';
import NotificationLabel from '../NotificationLabel/NotificationLabel';
import useHasReceivedRequests from '../../hooks/useHasReceivedRequests';

interface CustomButtonProps {
  title: string | ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  invertColors?: boolean;
  onHandle: () => void;
}

export default function CustomButton({
  title,
  style,
  disabled,
  invertColors = false,
  onHandle,
  titleStyle,
}: CustomButtonProps) {
  const requestsCount = useSelector((state: RootState) => state.data.giveRequests.length + state.data.swapRequests.length)
  const { hasReceived } = useHasReceivedRequests();

  return (
    <Pressable
      disabled={disabled}
      onPress={onHandle}
      style={({ pressed }) => {
        const isInverted = pressed ? !invertColors : invertColors;

        return [
          styles.button,
          style,
          disabled && { opacity: 0.4 },
          {
            backgroundColor: isInverted ? Colors.mainLight : Colors.mainDark,
          },
        ];
      }}
    >
      {({ pressed }) => {
        const isInverted = pressed ? !invertColors : invertColors;

        return (
          <View
            style={[
              styles.wrapper,
              {
                backgroundColor: isInverted ? Colors.mainDark : Colors.mainLight,
              },
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  color: isInverted ? Colors.mainLight : Colors.mainDark,
                },
                titleStyle,
              ]}
            >
              {title}
            </Text>
            {
              (title === "החלפות/מסירות" || (title === "החלפות" && hasReceived))
              &&
              <NotificationLabel num={requestsCount} position={[12,12]}/>
            }
          </View>
        );
      }}
    </Pressable>
  );
}


const styles = StyleSheet.create({
  button: {
    padding: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    padding: 8,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 600,
  },
});
