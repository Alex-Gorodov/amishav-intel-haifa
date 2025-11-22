import { Modal, ScrollView, StyleSheet, Image, Text, View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import ProtocolItemButton from '../../components/ProtocolItemButton/ProtocolItemButton';
import { Protocol } from '../../types/Protocol';
import { Ionicons } from '@expo/vector-icons';
import { Protocols } from '../../constants/Protocols';

export default function EmergencyProtocolsScreen() {
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null)

  return (
    <View style={styles.container}>
      <ProtocolItemButton
        title={'מקלחת חירום'}
        onHandle={() => setActiveProtocol(Protocols.emergencyShower)}
      />

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
              <Ionicons name="close" size={28} color="#333" />
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
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    maxHeight: '80%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
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
