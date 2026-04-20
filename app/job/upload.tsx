import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Image, Alert, ActivityIndicator,
  ScrollView, Switch, Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useJobsStore } from '../../store/jobs.store';

const C = {
  bg: '#FFFFFF',
  surface: '#F9FAFB',
  border: '#E5E7EB',
  text: '#111827',
  label: '#374151',
  muted: '#6B7280',
  blue: '#2563EB',
  blueSoft: '#EFF6FF',
  blueBorder: '#BFDBFE',
  navy: '#1A3B6E',
  navySoft: '#EEF2FF',
  navyBorder: '#C7D2FE',
  dark: '#1F2937',
  toggleOn: '#2563EB',
};

export default function UploadScreen() {
  const router = useRouter();
  const { setDraftPhotos, setDraftMeta, draftPhotoUris } = useJobsStore();

  const [photos, setPhotos] = useState<string[]>([]);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [handwritten, setHandwritten] = useState(false);
  const [uploading, setUploading] = useState(false);

  // When returning from native camera, pick up draftPhotoUris
  useFocusEffect(
    useCallback(() => {
      if (draftPhotoUris.length > 0) {
        setPhotos((prev) => {
          const merged = [...prev];
          for (const uri of draftPhotoUris) {
            if (!merged.includes(uri)) merged.push(uri);
          }
          return merged;
        });
        setDraftPhotos([]);
      }
    }, [draftPhotoUris])
  );

  // ── File picker ──────────────────────────────────────────────────────────
  const handleBrowseFile = useCallback(async () => {
    await Haptics.selectionAsync();
    Alert.alert('Select Document', 'Choose source', [
      {
        text: 'Photo Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permission needed', 'Allow photo access in Settings.'); return; }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.9,
            allowsMultipleSelection: true,
          });
          if (!result.canceled && result.assets.length > 0) {
            const uris = result.assets.map(a => a.uri);
            if (uris.length === 1) {
              setFileUri(uris[0]);
              setFileName(result.assets[0].fileName ?? 'image.jpg');
            } else {
              setPhotos(prev => [...prev, ...uris]);
            }
          }
        },
      },
      {
        text: 'PDF / Document',
        onPress: async () => {
          try {
            const result = await DocumentPicker.getDocumentAsync({
              type: ['application/pdf', 'image/jpeg', 'image/png'],
              copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets[0]) {
              setFileUri(result.assets[0].uri);
              setFileName(result.assets[0].name);
            }
          } catch {
            Alert.alert('Error', 'Could not open file picker.');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  // ── Web camera (file input capture) ─────────────────────────────────────
  const handleWebCamera = useCallback(() => {
    if (Platform.OS !== 'web') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    (input as any).capture = 'environment';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) setPhotos(prev => [...prev, URL.createObjectURL(file)]);
    };
    input.click();
  }, []);

  // ── Native camera ────────────────────────────────────────────────────────
  const handleNativeCamera = useCallback(() => {
    router.push('/job/camera?returnTo=upload');
  }, [router]);

  const handleCameraPress = Platform.OS === 'web' ? handleWebCamera : handleNativeCamera;

  const removePhoto = useCallback((index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ── Upload ────────────────────────────────────────────────────────────────
  const allUris = photos.length > 0 ? photos : fileUri ? [fileUri] : [];
  const canUpload = allUris.length > 0;

  const handleUpload = useCallback(async () => {
    if (!canUpload) { Alert.alert('Nothing to upload', 'Please select a file or take photos first.'); return; }
    setUploading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      setDraftPhotos(allUris);
      setDraftMeta(docTitle.trim(), handwritten);
      router.replace('/job/scan');
    } finally {
      setUploading(false);
    }
  }, [canUpload, allUris, docTitle, handwritten, setDraftPhotos, setDraftMeta, router]);

  const isImageFile = fileUri && /\.(jpg|jpeg|png)$/i.test(fileName ?? '');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>Upload your document</Text>

        {/* ── Upload zone ─────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[s.zone, photos.length > 0 && s.zoneHasPhotos]}
          onPress={photos.length > 0 ? undefined : handleBrowseFile}
          activeOpacity={photos.length > 0 ? 1 : 0.75}
        >
          {fileUri && isImageFile ? (
            <Image source={{ uri: fileUri }} style={s.preview} resizeMode="contain" />
          ) : photos.length === 0 ? (
            <View style={s.zoneEmpty}>
              <View style={s.zoneIconCircle}>
                <Text style={s.zoneIconArrow}>↑</Text>
              </View>
              <Text style={s.zoneMain}>
                Drag and drop or{' '}
                <Text style={s.zoneLink}>click to upload</Text>
              </Text>
              <Text style={s.zoneSub}>Max 200MB (PDF, ZIP, JPEG, PNG)</Text>
            </View>
          ) : null}

          {fileUri && !isImageFile && (
            <View style={s.zoneFile}>
              <Text style={s.zoneFileIcon}>📄</Text>
              <Text style={s.zoneFileName} numberOfLines={2}>{fileName}</Text>
              <TouchableOpacity onPress={() => { setFileUri(null); setFileName(null); }} style={s.zoneRemove}>
                <Text style={s.zoneRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Multi-photo strip ─────────────────────────────────────── */}
        {photos.length > 0 && (
          <View style={s.photoSection}>
            <View style={s.photoHeader}>
              <Text style={s.photoCount}>{photos.length} photo{photos.length !== 1 ? 's' : ''} selected</Text>
              <TouchableOpacity onPress={() => setPhotos([])}>
                <Text style={s.photoClearAll}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.photoStrip}>
              {photos.map((uri, i) => (
                <View key={`${uri}-${i}`} style={s.photoThumbWrap}>
                  <Image source={{ uri }} style={s.photoThumb} resizeMode="cover" />
                  <TouchableOpacity style={s.photoRemove} onPress={() => removePhoto(i)}>
                    <Text style={s.photoRemoveText}>✕</Text>
                  </TouchableOpacity>
                  <View style={s.photoBadge}>
                    <Text style={s.photoBadgeText}>{i + 1}</Text>
                  </View>
                </View>
              ))}
              {/* Add more */}
              <TouchableOpacity style={s.photoAddMore} onPress={handleCameraPress}>
                <Text style={s.photoAddIcon}>📷</Text>
                <Text style={s.photoAddText}>Add</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* ── Camera / add buttons (when no photos yet) ─────────────── */}
        {photos.length === 0 && !fileUri && (
          <View style={s.orRow}>
            <View style={s.orLine} />
            <Text style={s.orText}>or</Text>
            <View style={s.orLine} />
          </View>
        )}

        {photos.length === 0 && !fileUri && (
          <TouchableOpacity style={s.cameraBtn} onPress={handleCameraPress} activeOpacity={0.85}>
            <Text style={s.cameraBtnIcon}>📷</Text>
            <View style={s.cameraBtnText}>
              <Text style={s.cameraBtnLabel}>Take Photos with Camera</Text>
              <Text style={s.cameraBtnSub}>Capture multiple photos as one document</Text>
            </View>
            <Text style={s.cameraBtnChev}>›</Text>
          </TouchableOpacity>
        )}

        {/* ── Document Title + Language ──────────────────────────────── */}
        <View style={s.row}>
          <View style={s.col}>
            <Text style={s.label}>Document Title</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Raj Kumar Policy"
              placeholderTextColor={C.muted}
              value={docTitle}
              onChangeText={setDocTitle}
              returnKeyType="done"
            />
          </View>
          <View style={s.col}>
            <Text style={s.label}>Document Language</Text>
            <View style={s.fixedSelect}>
              <Text style={s.fixedSelectText}>English</Text>
              <Text style={s.fixedSelectChev}>∨</Text>
            </View>
          </View>
        </View>

        {/* ── Form Type (locked) ────────────────────────────────────── */}
        <View style={s.field}>
          <Text style={s.label}>Form Type</Text>
          <View style={s.lockedBadge}>
            <View style={s.lockedIcon}>
              <Text style={s.lockedIconText}>🔒</Text>
            </View>
            <Text style={s.lockedText}>LIC Claim Form</Text>
            <View style={s.lockedTag}>
              <Text style={s.lockedTagText}>Fixed</Text>
            </View>
          </View>
        </View>

        {/* ── Handwritten toggle ────────────────────────────────────── */}
        <View style={s.toggleRow}>
          <View style={s.toggleInfo}>
            <Text style={s.toggleLabel}>Handwritten</Text>
            <Text style={s.toggleSub}>Enable for handwritten policy forms</Text>
          </View>
          <Switch
            value={handwritten}
            onValueChange={setHandwritten}
            trackColor={{ false: C.border, true: C.toggleOn }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={s.divider} />

        {/* ── Actions ───────────────────────────────────────────────── */}
        <View style={s.actions}>
          <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()} activeOpacity={0.75}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.uploadBtn, !canUpload && s.uploadDisabled]}
            onPress={handleUpload}
            disabled={!canUpload || uploading}
            activeOpacity={0.88}
          >
            {uploading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={s.uploadText}>Upload</Text>
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 24, paddingBottom: 48 },

  title: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 20, letterSpacing: -0.4 },

  // ── Upload zone
  zone: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 14,
    minHeight: 128, marginBottom: 12,
    backgroundColor: C.surface, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center',
  },
  zoneHasPhotos: { minHeight: 0 },
  zoneEmpty: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24, gap: 8 },
  zoneIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.blueSoft, borderWidth: 1, borderColor: C.blueBorder,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  zoneIconArrow: { fontSize: 20, color: C.blue, fontWeight: '700' },
  zoneMain: { fontSize: 14, color: C.label, textAlign: 'center' },
  zoneLink: { color: C.blue, fontWeight: '600' },
  zoneSub: { fontSize: 12, color: C.muted, textAlign: 'center' },
  preview: { width: '100%', height: 160 },
  zoneFile: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, width: '100%' },
  zoneFileIcon: { fontSize: 28 },
  zoneFileName: { flex: 1, fontSize: 14, color: C.text, fontWeight: '500' },
  zoneRemove: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.border, alignItems: 'center', justifyContent: 'center' },
  zoneRemoveText: { fontSize: 12, color: C.muted, fontWeight: '600' },

  // ── Multi-photo strip
  photoSection: { marginBottom: 12 },
  photoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  photoCount: { fontSize: 13, fontWeight: '600', color: C.label },
  photoClearAll: { fontSize: 13, color: C.blue, fontWeight: '500' },
  photoStrip: { gap: 10, paddingVertical: 2 },
  photoThumbWrap: { position: 'relative' },
  photoThumb: { width: 80, height: 80, borderRadius: 10, borderWidth: 1.5, borderColor: C.border },
  photoRemove: {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
  },
  photoRemoveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  photoBadge: {
    position: 'absolute', bottom: 4, left: 4,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  photoBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  photoAddMore: {
    width: 80, height: 80, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.blueBorder, borderStyle: 'dashed',
    backgroundColor: C.blueSoft,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  photoAddIcon: { fontSize: 22 },
  photoAddText: { fontSize: 11, color: C.blue, fontWeight: '600' },

  // ── OR divider
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  orLine: { flex: 1, height: 1, backgroundColor: C.border },
  orText: { fontSize: 13, color: C.muted, fontWeight: '500' },

  // ── Camera button
  cameraBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 24,
  },
  cameraBtnIcon: { fontSize: 26 },
  cameraBtnText: { flex: 1 },
  cameraBtnLabel: { fontSize: 15, fontWeight: '600', color: C.text, marginBottom: 2 },
  cameraBtnSub: { fontSize: 12, color: C.muted },
  cameraBtnChev: { fontSize: 22, color: C.muted },

  // ── Fields
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  col: { flex: 1 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.text, backgroundColor: C.bg,
  },
  fixedSelect: {
    borderWidth: 1, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.surface,
  },
  fixedSelectText: { fontSize: 14, color: C.text },
  fixedSelectChev: { fontSize: 12, color: C.muted },

  // ── Locked badge
  lockedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: C.navyBorder, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    backgroundColor: C.navySoft,
  },
  lockedIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center' },
  lockedIconText: { fontSize: 14 },
  lockedText: { flex: 1, fontSize: 14, fontWeight: '600', color: C.navy },
  lockedTag: { backgroundColor: '#C7D2FE', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  lockedTagText: { fontSize: 11, fontWeight: '700', color: C.navy },

  // ── Handwritten toggle
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, marginBottom: 8,
  },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 2 },
  toggleSub: { fontSize: 12, color: C.muted },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },

  // ── Buttons
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: {
    paddingHorizontal: 22, paddingVertical: 13,
    borderRadius: 999, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.bg,
  },
  cancelText: { fontSize: 15, color: C.label, fontWeight: '500' },
  uploadBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 999,
    backgroundColor: C.dark, alignItems: 'center',
  },
  uploadDisabled: { backgroundColor: '#9CA3AF' },
  uploadText: { fontSize: 15, color: '#fff', fontWeight: '700' },
});
