import { useState, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { setError, uploadDocument } from '../store/actions';
import useUser from './useUser';
import { ErrorMessages } from '../constants/Messages';

export const useFileUpload = (
  onFileUploaded: (doc: {url: string; name: string}) => Promise<void> | void
) => {
  const user = useUser();
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);

  const uploadToCloudinary = useCallback(
    async (uri: string, type: string, name: string) => {
      try {
        setUploading(true);

        const formData = new FormData();
        formData.append("file", { uri, type, name } as any);
        formData.append("upload_preset", "ml_default");

        const endpoint = `https://api.cloudinary.com/v1_1/dluedowst/image/upload`;

        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!data.secure_url) {
          console.log("❌ Cloudinary error:", data);
          return;
        }

        if (user) {
          dispatch(uploadDocument({ user, document: { url: data.secure_url, name } }));
        }

        await onFileUploaded({ url: data.secure_url, name });

      } catch (e) {
        console.log("❌ Upload error:", e);
      } finally {
        setUploading(false);
      }
    },
    [dispatch, user, onFileUploaded]
  );

  const handlePickFileOrImage = useCallback(async () => {
    const file = await new Promise<{
      uri: string;
      type: string;
      name: string;
    } | null>(resolve => {
      Alert.alert(
        'בחר קובץ או תמונה או תעשה צילום חדש',
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
                const name = asset.name || `document-${Date.now()}.pdf`;

                let type = 'application/octet-stream';
                if (/\.(jpg|jpeg|png)$/i.test(name)) type = 'image/jpeg';
                if (/\.(pdf)$/i.test(name)) type = 'application/pdf';

                resolve({ uri, name, type });
              } else {
                resolve(null);
              }
            },
          },
          {
            text: 'תמונה מהגלריה',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.7,
              });

              if (!result.canceled && result.assets.length > 0) {
                const asset = result.assets[0];
                resolve({
                  uri: asset.uri,
                  name: asset.fileName || `image-${Date.now()}.jpg`,
                  type: 'image/jpeg',
                });
              } else {
                resolve(null);
              }
            },
          },
          {
            text: 'צילום תמונה',
            onPress: async () => {
              try {
                const permission = await ImagePicker.requestCameraPermissionsAsync();

                if (!permission.granted) {
                  dispatch(setError({message: ErrorMessages.CAMERA_ACCESS_NEEDED}))
                  resolve(null);
                  return;
                }

                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: false,
                  quality: 0.7,
                });

                if (!result.canceled && result.assets.length > 0) {
                  const asset = result.assets[0];
                  resolve({
                    uri: asset.uri,
                    name: asset.fileName || `camera-${Date.now()}.jpg`,
                    type: 'image/jpeg',
                  });
                } else {
                  resolve(null);
                }
              } catch (error) {
                console.error('❌ Camera error:', error);
                dispatch(setError({message: ErrorMessages.CAMERA_OPEN_ERROR}))
                resolve(null);
              }
            },
          },
          { text: 'ביטול', style: 'cancel', onPress: () => resolve(null) },
        ]
      );
    });

    if (file) {
      await uploadToCloudinary(file.uri, file.type, file.name);
    }
  }, [uploadToCloudinary]);

  return { handlePickFileOrImage, uploading };
};
