import { ScrollView, StyleSheet, Text, View, Image, Modal, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import CollapsibleHeader from '../CollapsibleHeader/CollapsibleHeader'
import { Protocol } from '../../types/Protocol'
import { Protocols } from '../../constants/Protocols';
import ProtocolItemButton from '../ProtocolItemButton/ProtocolItemButton';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';

interface ProtocolGroupProps {
  image: any;
  protocols: Protocol[];
}

export default function ProtocolGroup({image, protocols}: ProtocolGroupProps) {
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null)

  return (
    <CollapsibleHeader
          image={image}
          title={"חירום"}
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

        <Modal
          visible={!!activeProtocol}
          animationType="slide"
          transparent
          onRequestClose={() => setActiveProtocol(null)}
        >
          <View style={styles.overlay}>

            <TouchableOpacity
              style={styles.backdrop}
              activeOpacity={1}
              onPress={() => setActiveProtocol(null)}
            />

            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setActiveProtocol(null)}>
                <Ionicons name="close" size={28} color={Colors.mainDark} />
              </TouchableOpacity>

              <Text style={styles.title}>{activeProtocol?.title}</Text>

              {activeProtocol?.image && (
                <Image
                  source={activeProtocol.image}
                  style={{ width: '100%', height: 200, resizeMode: 'contain', marginBottom: 16 }}
                />
              )}

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.text}>{activeProtocol?.content}</Text>
              </ScrollView>
            </View>

          </View>
        </Modal>
      </View>
    </CollapsibleHeader>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    gap: 8,
  },
  itemWrapper: {
    padding: 8,
    justifyContent: 'center',
    borderRadius: 10,
    gap: 4,
    height: 240,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
    overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 40,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  scroll: {
    maxHeight: "90%",
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },

  title: {
    textAlign: 'right',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },

  text: {
    textAlign: 'right',
    fontSize: 16,
    lineHeight: 24,
  },
  modalContentWrapper: {
    position: "absolute",
    width: "100%",
  },
})
