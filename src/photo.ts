// Taking a photo for an item: the camera on a phone, the photo library on the web. Saved into the app's own files.

import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { keepPhoto } from './store';

export async function takePhoto(): Promise<string | null> {
  const camera = Platform.OS !== 'web' && (await ImagePicker.requestCameraPermissionsAsync()).granted;
  const res = camera
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
  if (res.canceled || !res.assets[0]) return null;
  return keepPhoto(res.assets[0].uri);
}
