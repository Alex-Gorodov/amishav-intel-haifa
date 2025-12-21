import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import TrainingProgressBar from '../components/TrainingProgressBar/TrainingProgressBar'
import useUser from '../hooks/useUser'
import useRefresh from '../hooks/useRefresh';

export default function TrainingsScreen() {
  const user = useUser();
  const refresh = useRefresh();

 const sortedTrainings = useMemo(() => {
    if (!user?.trainings) return [];

    const trainingsArray = Object.values(user.trainings).filter(t => t != null);

    return trainingsArray.sort((a, b) => {
      const now = Date.now();

      const aStart = a?.executionDate?.toDate?.()?.getTime() ?? 0;
      const aEnd = aStart + (a?.validityPeriod ?? 0) * 24 * 60 * 60 * 1000;
      const aProgress = aEnd > aStart ? Math.min(Math.max((now - aStart) / (aEnd - aStart), 0), 1) : 0;

      const bStart = b?.executionDate?.toDate?.()?.getTime() ?? 0;
      const bEnd = bStart + (b?.validityPeriod ?? 0) * 24 * 60 * 60 * 1000;
      const bProgress = bEnd > bStart ? Math.min(Math.max((now - bStart) / (bEnd - bStart), 0), 1) : 0;

      return bProgress - aProgress;
    });
  }, [user?.trainings]);

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 80 }}
        data={sortedTrainings || []}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => <TrainingProgressBar training={item} />}
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
