import { ActivityIndicator, StyleSheet, View } from 'react-native'
import React, { useState, useRef } from 'react'
import CollapsibleHeader from '../CollapsibleHeader/CollapsibleHeader'
import { Protocol, ProtocolPreview } from '../../types/Protocol'
import ProtocolItemButton from '../ProtocolItemButton/ProtocolItemButton';
import ProtocolModal from '../ProtocolModal/ProtocolModal';
import { fetchProtocolById } from '../../store/api/fetchProtocolById.api';

interface ProtocolGroupProps {
  image: any;
  title: string;
  protocols: ProtocolPreview[];
}

export default function ProtocolGroup({image, title, protocols}: ProtocolGroupProps) {
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null)
  const [loading, setLoading] = useState(false);

  const cacheRef = useRef<Record<string, Protocol>>({});

  const openProtocol = async (id: string) => {
    if (cacheRef.current[id]) {
      setActiveProtocol(cacheRef.current[id]);
      return;
    }

    setLoading(true);

    const protocol = await fetchProtocolById(id);

    if (protocol) {
      cacheRef.current[id] = protocol;
      setActiveProtocol(protocol);
    }

    setLoading(false);
  };

  return (
    <CollapsibleHeader
          image={image}
          title={title}
          maxHeight={240}
          minHeight={80}
        >
      <View style={styles.container}>
        {
          protocols.map((protocol) => (
            <ProtocolItemButton
              key={protocol.id}
              title={protocol.title}
              onHandle={() => openProtocol(protocol.id)}
            />
          ))
        }

        {loading ? (
          <ActivityIndicator />
        ) : (
          <ProtocolModal
            visible={!!activeProtocol}
            protocol={activeProtocol}
            onClose={() => setActiveProtocol(null)}
          />
        )}
      </View>
    </CollapsibleHeader>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    gap: 8,
  },
})
