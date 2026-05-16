import { StyleSheet, TextInput } from 'react-native'
import React, { useState, useMemo } from 'react'
import { Colors } from '../../constants';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/root-reducer';

export default function SearchField() {
  const [query, setQuery] = useState('');
  const posts = useSelector((state: RootState) => state.data.posts)

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = posts.filter((r) => {
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


    return filtered;
  }, [posts, query]);

    return (
      <TextInput
        placeholder="Search posts..."
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
    )

}

const styles = StyleSheet.create({
  search: {
    borderWidth: 2,
    borderColor: Colors.mainDark,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
})


