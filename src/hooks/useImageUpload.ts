import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

export const useImageUpload = (onImageUploaded: (url: string) => void) => {
  const [uploading, setUploading] = useState(false);

  const uploadToCloudinary = useCallback(async (uri: string, type?: string, name?: string) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: type || "image/jpeg",
      name: name || "document.jpg",
    } as any);

    formData.append("upload_preset", "amishav-intel-haifa-docs");

    setUploading(true);

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dluedowst/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Cloudinary response:", data);

      if (data.secure_url) {
        onImageUploaded(data.secure_url);
      } else {
        console.error("⚠ Cloudinary error", data);
      }
    } catch (err: any) {
      console.error("❌ Upload error:", err.message || err);
    } finally {
      setUploading(false);
    }
  }, [onImageUploaded]);

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      await uploadToCloudinary(asset.uri, asset.type, asset.fileName || '');
    }
  }, [uploadToCloudinary]);

  return { handlePickImage, uploading };
};
