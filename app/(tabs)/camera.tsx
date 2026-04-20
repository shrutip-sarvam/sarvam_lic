import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCameraPermissions } from '../../hooks/useCameraPermissions';
import { CameraCapture } from '../../components/camera/CameraCapture';
import { CropPreview } from '../../components/camera/CropPreview';
import { useDocumentProcessor } from '../../hooks/useDocumentProcessor';
import { UploadProgress } from '../../components/upload/UploadProgress';
import { COLORS } from '../../constants/theme';

type CameraStage = 'camera' | 'crop' | 'review';

export default function CameraScreen() {
  const router = useRouter();
  const { allGranted, isLoading, requestPermissions } = useCameraPermissions();
  const [stage, setStage] = useState<CameraStage>('camera');
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const { processDocument, isPending, processorState, cancel } = useDocumentProcessor();

  const handlePhotoTaken = (uri: string) => {
    setPendingUri(uri);
    setStage('crop');
  };

  const handleGalleryPick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (!result.canceled && result.assets[0]) {
      setPendingUri(result.assets[0].uri);
      setStage('crop');
    }
  };

  const handleCropConfirm = (uri: string) => {
    setCapturedPages((prev) => [...prev, uri]);
    setPendingUri(null);

    Alert.alert('Page added', `Page ${capturedPages.length + 1} captured.`, [
      { text: 'Add another page', onPress: () => setStage('camera') },
      { text: 'Process document', style: 'default', onPress: () => setStage('review') },
    ]);
  };

  const handleProcess = () => {
    const title = `Document ${new Date().toLocaleTimeString()}`;
    processDocument(
      { imageUris: capturedPages, title },
      {
        onSuccess: (data) => {
          setCapturedPages([]);
          setStage('camera');
          if (data?.docId) router.push(`/document/${data.docId}`);
        },
        onError: (err) => Alert.alert('Processing failed', (err as Error).message),
      }
    );
  };

  if (!allGranted) {
    return (
      <SafeAreaView style={styles.permissionsScreen}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permBody}>
          Akshar needs camera access to photograph and digitise your documents.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermissions} disabled={isLoading} accessibilityRole="button">
          <Text style={styles.permBtnText}>{isLoading ? 'Requesting...' : 'Grant Access'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isPending && processorState) {
    return (
      <View style={{ flex: 1 }}>
        <UploadProgress
          step={processorState.step}
          stepLabel={processorState.stepLabel}
          progress={processorState.progress}
          onCancel={cancel}
        />
      </View>
    );
  }

  if (stage === 'crop' && pendingUri) {
    return (
      <CropPreview
        imageUri={pendingUri}
        onConfirm={handleCropConfirm}
        onRetake={() => { setPendingUri(null); setStage('camera'); }}
      />
    );
  }

  if (stage === 'review') {
    return (
      <SafeAreaView style={styles.reviewScreen}>
        <Text style={styles.reviewTitle}>Ready to Process</Text>
        <ScrollView horizontal style={styles.thumbStrip} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {capturedPages.map((uri, i) => (
            <View key={i} style={styles.thumbWrap}>
              <Image source={{ uri }} style={styles.thumb} />
              <Text style={styles.thumbLabel}>Pg {i + 1}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.reviewActions}>
          <TouchableOpacity style={styles.addMoreBtn} onPress={() => setStage('camera')} accessibilityRole="button">
            <Text style={styles.addMoreText}>+ Add more pages</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.processBtn} onPress={handleProcess} accessibilityRole="button" accessibilityLabel="Process document">
            <Text style={styles.processBtnText}>Process {capturedPages.length} Page{capturedPages.length !== 1 ? 's' : ''} →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <CameraCapture
      onPhotoTaken={handlePhotoTaken}
      onGalleryPick={handleGalleryPick}
      pageCount={capturedPages.length}
      onAddPage={() => setStage('camera')}
    />
  );
}

const styles = StyleSheet.create({
  permissionsScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.primary, gap: 16 },
  permIcon: { fontSize: 60 },
  permTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  permBody: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20 },
  permBtn: { backgroundColor: COLORS.accent, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, marginTop: 8 },
  permBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  reviewScreen: { flex: 1, backgroundColor: COLORS.surface, paddingTop: 60 },
  reviewTitle: { fontSize: 22, fontWeight: '800', color: COLORS.primary, textAlign: 'center', marginBottom: 24 },
  thumbStrip: { flexGrow: 0 },
  thumbWrap: { alignItems: 'center', gap: 4 },
  thumb: { width: 80, height: 110, borderRadius: 8, borderWidth: 1, borderColor: COLORS.grey[200] },
  thumbLabel: { fontSize: 11, color: COLORS.grey[500] },
  reviewActions: { padding: 24, gap: 12, marginTop: 'auto' },
  addMoreBtn: { borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  addMoreText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  processBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  processBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
});
