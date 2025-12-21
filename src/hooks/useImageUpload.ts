import { ErrorMessages } from '../constants/Messages';
import * as ImagePicker from 'expo-image-picker';
import { useState, useCallback } from 'react';
import { setError } from '../store/actions';
import { useDispatch } from 'react-redux';
import { Alert } from 'react-native';

export const useImageUpload = (
  onImageUploaded: (url: string) => void
) => {
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();

  const uploadToCloudinary = useCallback(
    async (uri: string, type: string = 'image/jpeg', name: string = `image-${Date.now()}.jpg`) => {
      try {
        setUploading(true);

        const formData = new FormData();
        formData.append('file', { uri, type, name } as any);
        formData.append('upload_preset', 'ml_default');

        const res = await fetch('https://api.cloudinary.com/v1_1/dluedowst/image/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!data.secure_url) {
          console.error('❌ Cloudinary error:', data);
          return;
        }

        onImageUploaded(data.secure_url);
      } catch (e: any) {
        console.error('❌ Upload error:', e.message || e);
      } finally {
        setUploading(false);
      }
    },
    [onImageUploaded]
  );

  const handlePickImage = useCallback(async () => {
    const result = await new Promise<{ uri: string; type: string; name: string } | null>(resolve => {
      Alert.alert(
        'בחר תמונה או צלם חדש',
        '',
        [
          {
            text: 'תמונה מהגלריה',
            onPress: async () => {
              const picker = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.7,
              });
              if (!picker.canceled && picker.assets.length > 0) {
                const asset = picker.assets[0];
                resolve({
                  uri: asset.uri,
                  type: asset.type || 'image/jpeg',
                  name: asset.fileName || `image-${Date.now()}.jpg`,
                });
              } else {
                resolve(null);
              }
            },
          },
          {
            text: 'צלם תמונה',
            onPress: async () => {
              const permission = await ImagePicker.requestCameraPermissionsAsync();
              if (!permission.granted) {
                dispatch(setError({message: ErrorMessages.CAMERA_ACCESS_NEEDED}));
                resolve(null);
                return;
              }

              const camera = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.7,
              });

              if (!camera.canceled && camera.assets.length > 0) {
                const asset = camera.assets[0];
                resolve({
                  uri: asset.uri,
                  type: asset.type || 'image/jpeg',
                  name: asset.fileName || `camera-${Date.now()}.jpg`,
                });
              } else {
                resolve(null);
              }
            },
          },
          { text: 'ביטול', style: 'cancel', onPress: () => resolve(null) },
        ],
        { cancelable: true }
      );
    });

    if (result) {
      await uploadToCloudinary(result.uri, result.type, result.name);
    }
  }, [uploadToCloudinary]);

  return { handlePickImage, uploading };
};
