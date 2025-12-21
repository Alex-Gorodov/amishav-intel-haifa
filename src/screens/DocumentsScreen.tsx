import { StyleSheet, TouchableOpacity, ScrollView, Text, View, RefreshControl, Alert, Modal, Image } from 'react-native';
import ImageWithMenu from '../components/ImageWithMenu/ImageWithMenu';
import { getShortFileName } from '../utils/getShortFileName';
import { GlobalStyles } from '../constants/GlobalStyles';
import useRefresh from '../hooks/useRefresh';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import useUser from '../hooks/useUser';
import { useState } from 'react';

export default function DocumentsScreen() {
  const user = useUser();

  const [menuOpenedFor, setMenuOpenedFor] = useState<string | null>(null);

  const refresh = useRefresh();

  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isModalViewOpened, setModalViewOpened] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refresh.onRefresh} />
      }
    >
      {user?.documents.length !== 0
        ?
        user?.documents.map((d) => {

          return (

            <TouchableOpacity
              key={d.name}
              style={styles.item}
              onPress={() => {
                    setModalImage(d.url);
                    setModalViewOpened(true);
                  }}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMenuOpenedFor(d.name);
              }}
            >
              <View style={styles.item}>
                <ImageWithMenu
                  url={d.url}
                  name={d.name}
                  onPress={() => {
                    setModalImage(d.url);
                    setModalViewOpened(true);
                  }}
                  menuOpened={menuOpenedFor === d.name}
                  setMenuOpened={(v) => setMenuOpenedFor(v ? d.name : null)}
                />
                <Text style={{ textAlign: 'center', marginTop: 8 }}>
                  {getShortFileName(d.name, 16)}
                </Text>
              </View>

              <Modal
                visible={isModalViewOpened}
                transparent
                animationType="slide"
                onRequestClose={() => setModalViewOpened(false)}
              >
                <Pressable
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onPress={() => setModalViewOpened(false)}
                >
                  {modalImage && (
                    <Image
                      source={{ uri: modalImage }}
                      style={{ width: '90%', height: '70%', borderRadius: 16 }}
                      resizeMode="contain"
                    />
                  )}
                </Pressable>
              </Modal>

            </TouchableOpacity>

          )
        })
        :
        <View style={{flexDirection: 'column', marginTop: 40, justifyContent: 'center', alignItems: 'center', flex: 1, gap: 16}}>
          <Text style={GlobalStyles.emptyMessage}>אין לך עדיין מסמכים 📄</Text>
          <Text style={{fontSize: 14, fontWeight: 500, textAlign: 'center'}}> כדי להתחיל להעלות, לחץ/י על ➕</Text>
        </View>
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  content: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 100, gap: 8 },
  item: { width: '100%', backgroundColor: '#a0a0a0', borderRadius: 20, paddingBottom: 8, padding: 4 },
  imageContainer: { height: 150, overflow: 'hidden', borderRadius: 8 },
});
