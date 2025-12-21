import { StyleSheet, TextInput } from 'react-native'
import React, { useState, useMemo } from 'react'
import { Posts } from '../../constants/Posts';
import { Colors } from '../../constants';

export default function SearchField() {
  const [query, setQuery] = useState('');
  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = Posts.filter((r) => {
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
  }, [Posts, query]);

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


