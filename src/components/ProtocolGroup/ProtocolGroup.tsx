import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import CollapsibleHeader from '../CollapsibleHeader/CollapsibleHeader'
import { Protocol } from '../../types/Protocol'
import ProtocolItemButton from '../ProtocolItemButton/ProtocolItemButton';
import ProtocolModal from '../ProtocolModal/ProtocolModal';

interface ProtocolGroupProps {
  image: any;
  title: string;
  protocols: Protocol[];
}

export default function ProtocolGroup({image, title, protocols}: ProtocolGroupProps) {
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null)

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
              key={protocol.title}
              title={protocol.title}
              onHandle={() => setActiveProtocol(protocol)}
            />
          ))
        }

        <ProtocolModal
          visible={!!activeProtocol}
          protocol={activeProtocol}
          onClose={() => setActiveProtocol(null)}
        />
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
