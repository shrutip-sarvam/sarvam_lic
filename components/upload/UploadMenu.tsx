/**
 * UploadMenu — bottom sheet that pops up when user taps "+"
 * Options: Camera scan | Photo library | File (PDF/Doc)
 * Matches Figma: white card, rounded-32, shadow, item rows with icons + labels
 */
import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { impact } from '../../utils/haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

export type UploadSource =
  | { type: 'camera'; uri: string; base64: string }
  | { type: 'photo'; uri: string; base64: string }
  | { type: 'file'; uri: string; name: string; mimeType: string; base64: string };

interface Props {
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void; // Navigate to camera scanner
  onFileSelected: (source: UploadSource) => void;
}

export default function UploadMenu({ visible, onClose, onCameraPress, onFileSelected }: Props) {
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(300, { duration: 200 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const pickFromLibrary = useCallback(async () => {
    await impact("Light");
    onClose();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      base64: true,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onFileSelected({
        type: 'photo',
        uri: asset.uri,
        base64: asset.base64 ?? '',
      });
    }
  }, [onClose, onFileSelected]);

  const pickDocument = useCallback(async () => {
    await impact("Light");
    onClose();
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'application/msword',
             'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      try {
        let base64 = '';
        if (Platform.OS === 'web') {
          // On web, fetch the blob URL and convert to base64
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else {
          const FileSystem = await import('expo-file-system');
          base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
        onFileSelected({
          type: 'file',
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? 'application/octet-stream',
          base64,
        });
      } catch {
        Alert.alert('Error', 'Could not read the selected file.');
      }
    }
  }, [onClose, onFileSelected]);

  const handleCameraPress = useCallback(async () => {
    await impact("Light");
    onClose();
    // Small delay so sheet closes before navigator pushes camera
    setTimeout(onCameraPress, 250);
  }, [onClose, onCameraPress]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* Drag handle */}
        <View style={styles.handle} />

        <Text style={styles.sheetTitle}>Add content</Text>

        <MenuItem
          icon="📷"
          label="Scan with Camera"
          sublabel="Point camera at a document or text"
          onPress={handleCameraPress}
        />
        <MenuItem
          icon="🖼️"
          label="Photo Library"
          sublabel="Choose an image from your photos"
          onPress={pickFromLibrary}
        />
        <MenuItem
          icon="📄"
          label="Upload File"
          sublabel="PDF, Word, or image files"
          onPress={pickDocument}
        />

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} accessibilityRole="button">
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

function MenuItem({
  icon,
  label,
  sublabel,
  onPress,
}: {
  icon: string;
  label: string;
  sublabel: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={styles.menuIconWrap}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuSublabel}>{sublabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f9f8f8',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#131313',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d0d0d0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#a5a5a5',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ededed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 22 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '500', color: '#131313', marginBottom: 2 },
  menuSublabel: { fontSize: 13, color: '#a5a5a5' },
  cancelBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelText: { fontSize: 16, color: '#a5a5a5', fontWeight: '500' },
});
