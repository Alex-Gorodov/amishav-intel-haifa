import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Posts } from '../../constants/Posts';
import type { Post } from '../../types/Post';

type SortKey = 'title' | 'startTime' | 'endTime';

export default function PostsTable({ rows = Posts }: { rows?: Post[] }) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('title');
  const [asc, setAsc] = useState(true);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = rows.filter((r) => {
      if (!q) return true;
      const start = (r.defaultStartTime ?? '').toLowerCase();
      const end = (r.defaultEndTime ?? '').toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        start.includes(q) ||
        end.includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });

    // filtered.sort((a, b) => {
    //   const aKey = String(a[sortBy] ?? '');
    //   const bKey = String(b[sortBy] ?? '');
    //   return asc ? aKey.localeCompare(bKey) : bKey.localeCompare(aKey);
    // });

    return filtered;
  }, [rows, query, sortBy, asc]);

  function toggleSort(key: SortKey) {
    if (key === sortBy) setAsc((v) => !v);
    else {
      setSortBy(key);
      setAsc(true);
    }
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.hCell} onPress={() => toggleSort('startTime')}>
        <Text style={styles.hText}>תאריך</Text>
        <Text style={styles.hSmall}>{sortBy === 'startTime' ? (asc ? ' ↑' : ' ↓') : ''}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.hCell} onPress={() => toggleSort('title')}>
        <Text style={styles.hText}>עמדה</Text>
        <Text style={styles.hSmall}>{sortBy === 'title' ? (asc ? ' ↑' : ' ↓') : ''}</Text>
      </TouchableOpacity>


      {/* <TouchableOpacity style={styles.hCell} onPress={() => toggleSort('endTime')}>
        <Text style={styles.hText}>End</Text>
        <Text style={styles.hSmall}>{sortBy === 'endTime' ? (asc ? ' ↑' : ' ↓') : ''}</Text>
      </TouchableOpacity> */}
    </View>
  );

  const renderItem = ({ item }: { item: Post }) => (
    <Pressable style={styles.row} onPress={() => { /* optionally handle selection */ }}>
      <View style={styles.cell}>
        <Text style={styles.cellText}>{item.defaultStartTime}</Text>
      </View>
      <View style={styles.cellTitle}>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.timeText}>{item.defaultStartTime}-{item.defaultEndTime}</Text>
      </View>
      {/* <View style={styles.cell}>
        <Text style={styles.cellText}>{item.endTime}</Text>
      </View> */}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search posts..."
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />

      {renderHeader()}

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 8, padding: 8 },
  search: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  header: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 6 },
  hCell: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  hText: { marginLeft: 'auto', fontWeight: '600', textAlign: 'right' },
  hSmall: { fontSize: 12, color: '#666' },
  list: { height: '78%' },
  row: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 6 },
  cellTitle: { flex: 2 },
  cell: { flex: 1, alignItems: 'flex-start' },
  titleText: { fontSize: 16, textAlign: 'right' },
  timeText: { fontSize: 10, color: '#999', textAlign: 'right' },
  cellText: { color: '#333' },
  sep: { height: 1, backgroundColor: '#f0f0f0' },
});
