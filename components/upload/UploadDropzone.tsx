import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../../constants/theme';

interface UploadDropzoneProps {
  onFilePicked: (uri: string, name: string) => void;
}

export function UploadDropzone({ onFilePicked }: UploadDropzoneProps) {
  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      onFilePicked(asset.uri, asset.name ?? 'Document');
    }
  };

  return (
    <TouchableOpacity
      style={styles.zone}
      onPress={pickFile}
      accessibilityRole="button"
      accessibilityLabel="Upload document — tap to pick file"
    >
      <Text style={styles.icon}>☁️</Text>
      <Text style={styles.primary}>Tap to upload a document</Text>
      <Text style={styles.sub}>PDF, JPG, PNG, TIFF — up to 50 pages</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  zone: {
    borderWidth: 2,
    borderColor: COLORS.grey[300],
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.grey[100],
  },
  icon: { fontSize: 40 },
  primary: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  sub: { fontSize: 12, color: COLORS.grey[500] },
});
