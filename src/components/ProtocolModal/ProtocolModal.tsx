import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { Protocol } from '../../types/Protocol';

interface ProtocolModalProps {
  visible: boolean;
  protocol: Protocol | null;
  onClose: () => void;
}

export default function ProtocolModal({
  visible,
  protocol,
  onClose,
}: ProtocolModalProps) {
  if (!protocol) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={Colors.mainDark} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Text style={styles.title}>{protocol.title}</Text>

            {/* Header image */}
            {protocol.headerImage && (
              <Image
                source={protocol.headerImage}
                style={styles.headerImage}
              />
            )}

            {/* Gallery images */}
            {protocol.images && protocol.images.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
              >
                {protocol.images.map((img, index) => (
                  <Image
                    key={index}
                    source={img}
                    style={styles.galleryImage}
                  />
                ))}
              </ScrollView>
            )}

            {/* Content */}
            <Text style={styles.text}>{protocol.content}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 40,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: '60%',
    maxHeight: '80%',
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
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  galleryImage: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
    marginRight: 10,
    borderRadius: 10,
  },
  text: {
    textAlign: 'right',
    fontSize: 16,
    lineHeight: 24,
  },
});
