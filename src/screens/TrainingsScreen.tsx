import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import React, { useMemo } from 'react'
import TrainingProgressBar from '../components/TrainingProgressBar/TrainingProgressBar'
import useUser from '../hooks/useUser'
import useRefresh from '../hooks/useRefresh';

export default function TrainingsScreen() {
  const user = useUser();
  const refresh = useRefresh();

 const sortedTrainings = useMemo(() => {
    if (!user?.trainings) return [];

    // const trainingsArray = Object.values(user.trainings).filter(t => t != null);

    const trainingsArray = Object.entries(user.trainings)
      .map(([key, training]) => ({
        key: key as keyof typeof user.trainings,
        training,
      }))
      .filter(item => item.training != null);

      return trainingsArray.sort((a, b) => {
      const now = Date.now();

      const aStart = a.training.executionDate?.toDate?.()?.getTime() ?? 0;
      const aEnd = aStart + a.training.validityPeriod * 24 * 60 * 60 * 1000;
      const aProgress = aEnd > aStart ? Math.min(Math.max((now - aStart) / (aEnd - aStart), 0), 1) : 0;

      const bStart = b.training.executionDate?.toDate?.()?.getTime() ?? 0;
      const bEnd = bStart + b.training.validityPeriod * 24 * 60 * 60 * 1000;
      const bProgress = bEnd > bStart ? Math.min(Math.max((now - bStart) / (bEnd - bStart), 0), 1) : 0;

      return bProgress - aProgress;
    });
  }, [user?.trainings]);


  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 80 }}
        data={sortedTrainings}
        keyExtractor={(item) => item.training.id}
        renderItem={({ item }) => (
          <TrainingProgressBar
            training={item.training}
            trainingKey={item.key}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refresh.onRefresh} />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    flex: 1
  },
})
