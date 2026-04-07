// import { Pressable, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
// import React, { ReactNode } from 'react';
// import { Colors } from '../../constants';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../store/root-reducer';
// import NotificationLabel from '../NotificationLabel/NotificationLabel';
// import useHasReceivedRequests from '../../hooks/useHasReceivedRequests';

// interface CustomButtonProps {
//   title: string | ReactNode;
//   style?: StyleProp<ViewStyle>;
//   titleStyle?: StyleProp<TextStyle>;
//   disabled?: boolean;
//   invertColors?: boolean;
//   onHandle: () => void;
// }

// export default function CustomButton({
//   title,
//   style,
//   disabled,
//   invertColors = false,
//   onHandle,
//   titleStyle,
// }: CustomButtonProps) {
//   const requestsCount = useSelector((state: RootState) => state.data.giveRequests.length + state.data.swapRequests.length)
//   const { hasReceived } = useHasReceivedRequests();

//   return (
    // <Pressable
    //   disabled={disabled}
    //   onPress={onHandle}
      // style={({ pressed }) => {
      //   const isInverted = pressed ? !invertColors : invertColors;

      //   return [
      //     styles.button,
      //     style,
      //     disabled && { opacity: 0.4 },
      //     {
      //       backgroundColor: isInverted ? Colors.mainLight : Colors.mainDark,
      //     },
      //   ];
      // }}
    // >
    //   {({ pressed }) => {
    //     const isInverted = pressed ? !invertColors : invertColors;

    //     return (
    //       <View
    //         style={[
    //           styles.wrapper,
    //           {
    //             backgroundColor: isInverted ? Colors.mainDark : Colors.mainLight,
    //           },
    //         ]}
    //       >
    //         <Text
    //           style={[
    //             styles.text,
    //             {
    //               color: isInverted ? Colors.mainLight : Colors.mainDark,
    //             },
    //             titleStyle,
    //           ]}
    //         >
    //           {title}
    //         </Text>
    //         {
    //           (title === "החלפות/מסירות" || (title === "החלפות" && hasReceived))
    //           &&
    //           <NotificationLabel num={requestsCount} position={[12,12]}/>
    //         }
    //       </View>
    //     );
    //   }}
    // </Pressable>
//   );
// }


// const styles = StyleSheet.create({
//   button: {
//     padding: 4,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   wrapper: {
//     width: '100%',
//     padding: 8,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   text: {
//     fontSize: 16,
//     fontWeight: 600,
//   },
// });



import React, { ReactNode, useRef } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
  Animated,
} from 'react-native';
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
  const animated = useRef(new Animated.Value(0)).current;

  const requestsCount = useSelector(
    (state: RootState) =>
      state.data.giveRequests.length + state.data.swapRequests.length
  );

  const { hasReceived } = useHasReceivedRequests();

  // 🎯 Анимации
  const handlePressIn = () => {
    Animated.timing(animated, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animated, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  // 🎨 Интерполяции цветов
  const backgroundColor = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [
      invertColors ? Colors.mainLight : Colors.mainDark,
      invertColors ? Colors.mainDark : Colors.mainLight,
    ],
  });

  const innerColor = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [
      invertColors ? Colors.mainDark : Colors.mainLight,
      invertColors ? Colors.mainLight : Colors.mainDark,
    ],
  });

  const textColor = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [
      invertColors ? Colors.mainLight : Colors.mainDark,
      invertColors ? Colors.mainDark : Colors.mainLight,
    ],
  });

  // ✨ Scale эффект
  const scale = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.97],
  });

  return (
    <Pressable
      disabled={disabled}
      onPress={onHandle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
    >
      <Animated.View
        style={[
          styles.button,
          style,
          disabled && { opacity: 0.4 },
          {
            backgroundColor,
            transform: [{ scale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.wrapper,
            {
              backgroundColor: innerColor,
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.text,
              {
                color: textColor,
              },
              titleStyle,
            ]}
          >
            {title}
          </Animated.Text>

          {(title === 'החלפות/מסירות' ||
            (title === 'החלפות' && hasReceived)) && (
            <NotificationLabel num={requestsCount} position={[12, 12]} />
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44
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
    fontWeight: '600',
  },
});
