import { Pressable, StyleSheet, Text, View, Animated, Easing } from 'react-native';
import React, { useRef, useState } from 'react';
import { Training } from '../../types/Training';
import { Colors, SCREEN_WIDTH } from '../../constants';

interface TrainingProgressBarProps {
  training: Training;
}

export default function TrainingProgressBar({ training }: TrainingProgressBarProps) {
  const currentDate = Date.now();
  const executionDate = training.executionDate && training.executionDate.toDate().getTime();
  const dateOfDeadline = executionDate ? executionDate + training.validityPeriod * 24 * 60 * 60 * 1000 : 0;

  const total = executionDate && dateOfDeadline - executionDate;
  const passed = executionDate && currentDate - executionDate;
  const progress = passed && total && Math.min(Math.max(passed / total, 0), 1);

  const animatedWidth = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress ? progress * (SCREEN_WIDTH - 16) : 0,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [open, setOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  const progressBarBackgroundColor = progress && progress <= 0.75 ? Colors.progressBarValid : progress && progress <= 0.9 ? Colors.progressBarAttention : Colors.progressBarInvalid;

  const toggle = () => {
    setOpen(prev => !prev);
    Animated.timing(animatedHeight, {
      toValue: open ? 0 : contentHeight,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.wrapper}>

      <Pressable style={styles.container} onPress={toggle}>
        <Animated.View style={[styles.fill, { width: animatedWidth, backgroundColor: progressBarBackgroundColor }]} />
        <Text style={styles.title}>{training.title}</Text>
      </Pressable>

      <Animated.View style={[styles.expandArea, { height: animatedHeight }]}>

        <View
          style={styles.inner}
          onLayout={e => {
            const height = e.nativeEvent.layout.height;
            setContentHeight(height);
          }}
        >
          <Text style={styles.label}>תאריך ביצוע אחרון:</Text>
          <Text style={styles.value}>{executionDate === null ? 'אין מידע' : new Date(executionDate).toLocaleDateString()}</Text>

          <Text style={styles.label}>בתוקף עד:</Text>
          <Text style={styles.value}>{dateOfDeadline === 0 ? 'אין מידע' : new Date(dateOfDeadline).toLocaleDateString()}</Text>

          {training.description ? (
            <>
              <Text style={styles.label}>הערות:</Text>
              <Text style={styles.value}>{training.description}</Text>
            </>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
    height: 60,
    borderRadius: 40,
    justifyContent: 'center',
    backgroundColor: '#f3f3f3',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    overflow: 'hidden',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.progressBarValid,
    borderBottomLeftRadius: 40,
    borderTopLeftRadius: 40,
    borderBottomRightRadius: 2,
    borderTopRightRadius: 2,
  },
  title: {
    textAlign: 'center',
    fontWeight: 700,
    fontSize: 20,
    color: '#222',
  },
  expandArea: {
    marginTop: -16,
    zIndex: -1,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderTopWidth: 0,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  },
  inner: {
    padding: 20,
    paddingTop: 28,
    position: 'absolute',
    width: '100%',
  },
  label: {
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 6,
    color: Colors.mainDark,
  },
  value: {
    textAlign: 'right',
    fontSize: 14,
    color: '#555',
  },
});
