/**
 * Upload Document Dialog — shown after camera capture or for direct file upload.
 * Matches Figma/Akshar Vision design:
 *   - Dashed upload zone with click-to-upload
 *   - Document Title + Document Language (side-by-side)
 *   - Form Type dropdown (LIC Claim Form — only option for LIC)
 *   - Cancel / Upload actions
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Image, Alert, ActivityIndicator,
  ScrollView, Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useJobsStore } from '../../store/jobs.store';

const C = {
  bg: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceSoft: '#FAFAFA',
  border: '#E5E7EB',
  borderDashed: '#D1D5DB',
  text: '#111827',
  label: '#374151',
  muted: '#6B7280',
  mutedSoft: '#9CA3AF',
  blue: '#5B6DFE',
  blueSoft: '#EEF0FF',
  dark: '#1F2937',
  darkHover: '#111827',
};

export default function UploadDocumentScreen() {
  const router = useRouter();
  const { setDraftPhotos, setDraftMeta, draftPhotoUris } = useJobsStore();

  const [photos, setPhotos] = useState<string[]>([]);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // Pick up photos captured from the camera screen
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

  // Click-to-upload: opens file picker on web + native
  const handleClickToUpload = useCallback(async () => {
    if (Platform.OS === 'web') {
      // Web: native HTML file input — no permissions dialog
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png,image/jpeg,application/pdf,application/zip';
      input.onchange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (file.type.startsWith('image/')) {
          setPhotos((prev) => [...prev, url]);
        } else {
          setFileUri(url);
          setFileName(file.name);
        }
      };
      input.click();
      return;
    }

    // Native: ask what to pick
    await Haptics.selectionAsync();
    Alert.alert('Upload Document', 'Choose source', [
      {
        text: 'Camera',
        onPress: () => router.push('/job/camera?returnTo=upload'),
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permission needed', 'Allow photo access.'); return; }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.9,
            allowsMultipleSelection: true,
          });
          if (!result.canceled && result.assets.length > 0) {
            setPhotos(prev => [...prev, ...result.assets.map(a => a.uri)]);
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
  }, [router]);

  const removePhoto = useCallback((index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ── Upload ────────────────────────────────────────────────────────────────
  const allUris = photos.length > 0 ? photos : fileUri ? [fileUri] : [];
  const canUpload = allUris.length > 0;

  const handleUpload = useCallback(async () => {
    if (!canUpload) { Alert.alert('Nothing to upload', 'Please attach a file or take photos first.'); return; }
    setUploading(true);
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      setDraftPhotos(allUris);
      setDraftMeta(docTitle.trim() || 'Untitled Document', false);
      router.replace('/job/scan');
    } finally {
      setUploading(false);
    }
  }, [canUpload, allUris, docTitle, setDraftPhotos, setDraftMeta, router]);

  const hasAttachment = photos.length > 0 || !!fileUri;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Dialog card ─────────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.title}>Upload your document</Text>

          {/* ── Upload zone (dashed border) ──────────────────────── */}
          <TouchableOpacity
            style={s.zone}
            onPress={handleClickToUpload}
            activeOpacity={0.75}
          >
            {!hasAttachment ? (
              <View style={s.zoneInner}>
                <View style={s.zoneIconBox}>
                  <Text style={s.zoneIconArrow}>↑</Text>
                </View>
                <View style={s.zoneTextCol}>
                  <Text style={s.zoneMain}>
                    Drag and drop or{' '}
                    <Text style={s.zoneLink}>click to upload</Text>
                  </Text>
                  <Text style={s.zoneSub}>Max 200MB (PDF, ZIP, JPEG, PNG)</Text>
                </View>
              </View>
            ) : (
              <View style={s.zoneFilled}>
                <View style={s.zoneIconBox}>
                  <Text style={s.zoneIconArrow}>↑</Text>
                </View>
                <View style={s.zoneTextCol}>
                  <Text style={s.zoneMain}>
                    {photos.length > 0
                      ? `${photos.length} photo${photos.length !== 1 ? 's' : ''} attached`
                      : fileName}
                  </Text>
                  <Text style={s.zoneLink}>Click to add more</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* ── Photo thumbnails (if any) ────────────────────────── */}
          {photos.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.photoStrip}
              style={{ marginBottom: 8 }}
            >
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
            </ScrollView>
          )}

          {fileUri && (
            <View style={s.fileChip}>
              <Text style={s.fileChipIcon}>📄</Text>
              <Text style={s.fileChipName} numberOfLines={1}>{fileName}</Text>
              <TouchableOpacity
                onPress={() => { setFileUri(null); setFileName(null); }}
                style={s.fileChipRemove}
              >
                <Text style={s.fileChipRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Title + Language row ─────────────────────────────── */}
          <View style={s.row}>
            <View style={s.col}>
              <Text style={s.label}>Document Title</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Mahabharath"
                placeholderTextColor={C.mutedSoft}
                value={docTitle}
                onChangeText={setDocTitle}
                returnKeyType="done"
              />
            </View>
            <View style={s.col}>
              <Text style={s.label}>Document Language</Text>
              <View style={s.select}>
                <Text style={s.selectText}>English</Text>
                <Text style={s.selectChev}>⌄</Text>
              </View>
            </View>
          </View>

          {/* ── Form Type (only LIC Claim Form) ──────────────────── */}
          <View style={s.field}>
            <Text style={s.label}>Form Type</Text>
            <View style={s.select}>
              <Text style={s.selectText}>LIC Claim Form</Text>
              <Text style={s.selectChev}>⌄</Text>
            </View>
          </View>

          {/* ── Actions ──────────────────────────────────────────── */}
          <View style={s.actions}>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() => router.back()}
              activeOpacity={0.75}
            >
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { padding: 20, paddingTop: 40, minHeight: '100%' as any, alignItems: 'center' },

  // ── Dialog card ──────────────────────────────────────────────
  card: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: C.bg,
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
  },
  title: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 20, letterSpacing: -0.3 },

  // ── Upload zone (dashed) ─────────────────────────────────────
  zone: {
    borderWidth: 1.5,
    borderColor: C.borderDashed,
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: C.bg,
    paddingVertical: 22,
    paddingHorizontal: 22,
    marginBottom: 20,
    minHeight: 112,
    justifyContent: 'center',
  },
  zoneInner: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  zoneFilled: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  zoneIconBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: C.blueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  zoneIconArrow: { fontSize: 20, color: C.blue, fontWeight: '700' },
  zoneTextCol: { flex: 1, gap: 4 },
  zoneMain: { fontSize: 15, color: C.text, fontWeight: '500' },
  zoneLink: { color: C.blue, fontWeight: '600' },
  zoneSub: { fontSize: 13, color: C.muted },

  // ── Photo thumbnails ─────────────────────────────────────────
  photoStrip: { gap: 10, paddingVertical: 4 },
  photoThumbWrap: { position: 'relative' },
  photoThumb: { width: 72, height: 72, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  photoRemove: {
    position: 'absolute', top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
  },
  photoRemoveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  photoBadge: {
    position: 'absolute', bottom: 4, left: 4,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  photoBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // ── File chip ────────────────────────────────────────────────
  fileChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.surfaceSoft, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
  },
  fileChipIcon: { fontSize: 22 },
  fileChipName: { flex: 1, fontSize: 14, color: C.text, fontWeight: '500' },
  fileChipRemove: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.border, alignItems: 'center', justifyContent: 'center' },
  fileChipRemoveText: { fontSize: 11, color: C.muted, fontWeight: '700' },

  // ── Fields ───────────────────────────────────────────────────
  row: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  col: { flex: 1 },
  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '500', color: C.label, marginBottom: 8 },

  input: {
    borderWidth: 1, borderColor: C.border, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, color: C.text, backgroundColor: C.bg,
  },
  select: {
    borderWidth: 1, borderColor: C.border, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.bg,
  },
  selectText: { fontSize: 14, color: C.text },
  selectChev: { fontSize: 14, color: C.muted },

  // ── Actions ──────────────────────────────────────────────────
  actions: {
    flexDirection: 'row', justifyContent: 'flex-end',
    gap: 10, marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 26, paddingVertical: 11,
    borderRadius: 999, backgroundColor: C.surfaceSoft,
  },
  cancelText: { fontSize: 14, color: C.text, fontWeight: '500' },
  uploadBtn: {
    paddingHorizontal: 32, paddingVertical: 11,
    borderRadius: 999, backgroundColor: C.dark,
    alignItems: 'center', justifyContent: 'center',
    minWidth: 110,
  },
  uploadDisabled: { backgroundColor: C.mutedSoft },
  uploadText: { fontSize: 14, color: '#fff', fontWeight: '600' },
});
