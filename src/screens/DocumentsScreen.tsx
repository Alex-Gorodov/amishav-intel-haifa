import { StyleSheet, Image, TouchableOpacity, ScrollView, Text, View, Linking, RefreshControl, Dimensions } from 'react-native';
import React, { useCallback } from 'react';
import useUser from '../hooks/useUser';
import { WebView } from 'react-native-webview';
import { getShortFileName } from '../utils/getShortFileName';
import { fetchUsers } from '../store/api/fetch.api';
import { useDispatch } from 'react-redux';
import * as Haptics from 'expo-haptics';
import Pdf from 'react-native-pdf';

export default function DocumentsScreen() {
  const user = useUser();
  const dispatch = useDispatch();

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchUsers(dispatch);
  }, [dispatch]);

  const source = { uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf', cache: true };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
    >
      {user?.documents.length !== 0
        ?
        user?.documents.map((d) => {
          const isImage = /\.(jpg|jpeg|png)$/i.test(d.url);
          const isPdf = /\.pdf$/i.test(d.url);

          return (
            <TouchableOpacity
              key={d.name + Math.random() * 100}
              style={styles.item}
              onPress={() => Linking.openURL(d.url)}
            >
              <View>
                {isImage && (
                  <Image
                    source={{ uri: d.url }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                )}
                {isPdf && (
                  // <WebView source={{ uri: d.url }} style={{ flex: 1, width: '100%' }} />
                  <Pdf
                    source={source}
                    onLoadComplete={(numberOfPages,filePath) => {
                        console.log(`Number of pages: ${numberOfPages}`);
                    }}
                    onPageChanged={(page,numberOfPages) => {
                        console.log(`Current page: ${page}`);
                    }}
                    onError={(error) => {
                        console.log(error);
                    }}
                    onPressLink={(uri) => {
                        console.log(`Link pressed: ${uri}`);
                    }}
                    style={styles.pdf}/>
                )}
                <Text style={{textAlign: 'center', marginTop: 8}}>{d.name.length > 12 ? getShortFileName(d.name, 8) : d.name }</Text>
              </View>
            </TouchableOpacity>
          )
        })
        :
        <View style={{flexDirection: 'column', marginTop: 40, justifyContent: 'center', alignItems: 'center', flex: 1, gap: 16}}>
          <Text style={{fontSize: 18, fontWeight: 600}}>אין לך עדיין מסמכים 📄</Text>
          <Text style={{fontSize: 14, fontWeight: 500}}> כדי להתחיל להעלות, לחץ/י על ➕</Text>
        </View>
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  content: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  item: { width: '48%', marginTop: 16, backgroundColor: '#a0a0a0', borderRadius: 20, paddingBottom: 8, padding: 4 },
  image: { width: '100%', height: 200, borderRadius: 8 },
  pdfContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  pdfText: { marginTop: 8, fontSize: 14, color: '#333' },

    pdf: {
        flex:1,
        width:Dimensions.get('window').width,
        height:Dimensions.get('window').height,
    }
});
