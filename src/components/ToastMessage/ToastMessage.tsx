import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/root-reducer';
import { setError, setSuccess } from '../../store/actions';
import { Colors } from '../../constants';

const { width } = Dimensions.get('window');

export default function ToastMessage() {
  const dispatch = useDispatch();
  const error = useSelector((state: RootState) => state.app.error);
  const success = useSelector((state: RootState) => state.app.success);

  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
  const newMessage = success ?? error;
  if (!newMessage) return;

  setMessage(newMessage);
  setIsError(!!error && !success);
  setVisible(true);

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();

  const timer = setTimeout(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setMessage(null);
      setIsError(false);

    });
    if (success) dispatch(setSuccess({ message: null }));
    if (error) dispatch(setError({ message: null }));
  }, 3000);

  return () => clearTimeout(timer);
}, [error, success]);


  if (!visible || !message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, backgroundColor: isError ? '#ff4d4d' : '#4BB543' },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    maxWidth: width - 40,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: Colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
