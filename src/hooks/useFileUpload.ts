import { useState, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { uploadDocument } from '../store/actions';
import useUser from './useUser';

export const useFileUpload = (onFileUploaded: (doc: {url: string, name: string}) => void) => {
  const user = useUser();
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();

  // const uploadToCloudinary = useCallback(
  //   async (uri: string, type: string, name: string) => {
  //     const isImage = type.startsWith('image');
  //     const preset = isImage ? 'ml_default' : 'ml_raw';

  //     const formData = new FormData();
  //     formData.append('file', { uri, type, name } as any);
  //     formData.append('upload_preset', preset);

  //     // ← ВАЖНО: выбираем правильный endpoint!
  //     const uploadUrl = isImage
  //       ? 'https://api.cloudinary.com/v1_1/dluedowst/image/upload'
  //       : 'https://api.cloudinary.com/v1_1/dluedowst/raw/upload';

  //     setUploading(true);

  //     try {
  //       const response = await fetch(uploadUrl, {
  //         method: 'POST',
  //         body: formData,
  //       });

  //       const data = await response.json();

  //       if (data.secure_url) {
  //         onFileUploaded({ url: data.secure_url, name });

  //         if (user) {
  //           dispatch(uploadDocument({ user, document: {url: data.secure_url, name} }));
  //         }
  //       } else {
  //         console.error('Cloudinary response error:', data);
  //       }
  //     } catch (err: any) {
  //       console.error('❌ Upload error:', err.message || err);
  //     } finally {
  //       setUploading(false);
  //     }
  //   },
  //   [onFileUploaded]
  // );


  const uploadToCloudinary = useCallback(
    async (uri: string, type: string, name: string) => {
      setUploading(true)
      const formData = new FormData();
      formData.append("file", { uri, type, name } as any);

      // выбираем нужный preset
      formData.append("upload_preset", "ml_default");

      const endpoint = `https://api.cloudinary.com/v1_1/dluedowst/image/upload`;

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!data.secure_url) {
          console.log("❌ Cloudinary error", data);
          return;
        }
        user && dispatch(uploadDocument({ user, document: {url: data.secure_url, name} }));
        onFileUploaded({ url: data.secure_url, name });
        setUploading(false);
      } catch (e) {
        console.log("❌ Upload error:", e);
      }
    },
    [onFileUploaded]
  );

  const handlePickFileOrImage = useCallback(async () => {
    const file = await new Promise<{ uri: string; type: string; name: string } | null>(
      async (resolve) => {
        Alert.alert(
          'בחר קובץ או תמונה',
          '',
          [
            {
              text: 'קובץ',
              onPress: async () => {
                const result = await DocumentPicker.getDocumentAsync({
                  type: '*/*',
                  copyToCacheDirectory: true,
                });

                if (!result.canceled && result.assets.length > 0) {
                  const asset = result.assets[0];
                  const uri = asset.uri;
                  const name = asset.name || `document-${new Date().getTime()}.pdf`;
                  let type = 'application/octet-stream';

                  if (/\.(jpg|jpeg|png)$/i.test(name)) type = 'image/jpeg';
                  if (/\.(pdf)$/i.test(name)) type = 'application/pdf';

                  await uploadToCloudinary(uri, type, name);
                } else {
                  resolve(null);
                }
              },
            },
            {
              text: 'תמונה',
              onPress: async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.7,
                });

                if (!result.canceled && result.assets.length > 0) {
                  const asset = result.assets[0];

                  resolve({
                    uri: asset.uri,
                    name: asset.fileName || `image-${new Date().getTime()}.jpg`,
                    type: 'image/jpeg',
                  });
                } else {
                  resolve(null);
                }
              },
            },
            { text: 'ביטול', style: 'cancel', onPress: () => resolve(null) },
          ]
        );
      }
    );

    if (file) {
      await uploadToCloudinary(file.uri, file.type, file.name);
    }
  }, [uploadToCloudinary]);

  return { handlePickFileOrImage, uploading };
};
