import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants';
import SalaryCard from '../SalaryCard/SalaryCard';

interface SummarySalaryProps {
  totalHours: string;
  totalShabbatHours: string;
  totalSalary: string;
  scrollY: Animated.Value;
}

export default function SummarySalary({ totalHours, totalShabbatHours, totalSalary, scrollY }: SummarySalaryProps) {

  const HEADER_MAX_HEIGHT = 160;
  const HEADER_MIN_HEIGHT = 50;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp'
  });

  const headerMargin = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [8, 0],
    extrapolate: 'clamp'
  });

  const headerBorderRadius = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [10, 0],
    extrapolate: 'clamp'
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const columnOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const rowOpacity = scrollY.interpolate({
    inputRange: [40, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });


  return (
    <Animated.View style={[styles.summary, { height: headerHeight, margin: headerMargin, borderRadius: headerBorderRadius, overflow: 'hidden' }]}>

      <Animated.View style={{ opacity: titleOpacity }}>
        <SalaryCard salary={totalSalary} style={{backgroundColor: 'transparent'}} />
      </Animated.View>

      <Animated.View style={{ flexDirection: 'row', width: '100%', marginBottom: -12, opacity: columnOpacity }}>
        <View style={{backgroundColor: Colors.primary, flex: 1, paddingVertical: 8}}>
          <Text style={{fontWeight: 600, fontSize: 26, textAlign: 'center'}}>{totalShabbatHours}</Text>
          <Text style={styles.summaryItem}>שעות שבת</Text>
        </View>
        <View style={{backgroundColor: Colors.primary, flex: 1, paddingVertical: 8}}>
          <Text style={{fontWeight: 600, fontSize: 26, textAlign: 'center'}}>{totalHours}</Text>
          <Text style={styles.summaryItem}>ס״כ שעות</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.summaryRowSmall, { opacity: rowOpacity }]}>
        <Text style={styles.summarySmall}>{totalHours} ⏱</Text>
        <Text style={styles.summarySmall}>{totalShabbatHours} 🕯</Text>
        <Text style={styles.summarySmall}>{totalSalary} 💵</Text>
      </Animated.View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  summary: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.primaryLight,
    paddingTop: 24,
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  summaryItem: {
    textAlign: 'center',
    fontSize: 12,
    padding: 4,
  },
  summaryRowSmall: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginTop: -20,
    paddingBottom: 14,
  },
  summarySmall: {
    fontSize: 16,
    fontWeight: '700'
  }
});
