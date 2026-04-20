/**
 * Upload Document dialog — matches Akshar Vision upload modal.
 * Dashed border zone, pill inputs, Cancel/Upload actions.
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
import { useJobsStore } from '../../store/jobs.store';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT } from '../../components/ui/tokens';

export default function UploadDocumentScreen() {
  const router = useRouter();
  const { setDraftPhotos, setDraftMeta, draftPhotoUris } = useJobsStore();

  const [photos, setPhotos] = useState<string[]>([]);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (draftPhotoUris.length > 0) {
        setPhotos((prev) => {
          const merged = [...prev];
          for (const uri of draftPhotoUris) if (!merged.includes(uri)) merged.push(uri);
          return merged;
        });
        setDraftPhotos([]);
      }
    }, [draftPhotoUris])
  );

  const handleClickToUpload = useCallback(async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png,image/jpeg,application/pdf';
      input.multiple = true;
      input.onchange = (e: Event) => {
        const files = Array.from((e.target as HTMLInputElement).files ?? []);
        const imgUrls: string[] = [];
        for (const f of files) {
          const url = URL.createObjectURL(f);
          if (f.type.startsWith('image/')) imgUrls.push(url);
          else { setFileUri(url); setFileName(f.name); }
        }
        if (imgUrls.length > 0) setPhotos((p) => [...p, ...imgUrls]);
      };
      input.click();
      return;
    }

    Alert.alert('Upload Document', 'Choose source', [
      { text: 'Camera', onPress: () => router.push('/job/camera?returnTo=upload') },
      {
        text: 'Photo Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permission needed', 'Allow photo access.'); return; }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], quality: 0.9, allowsMultipleSelection: true,
          });
          if (!result.canceled && result.assets.length > 0) {
            setPhotos((p) => [...p, ...result.assets.map((a) => a.uri)]);
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
    setPhotos((p) => p.filter((_, i) => i !== index));
  }, []);

  const allUris = photos.length > 0 ? photos : fileUri ? [fileUri] : [];
  const canUpload = allUris.length > 0;

  const handleUpload = useCallback(async () => {
    if (!canUpload) { Alert.alert('Nothing to upload', 'Attach a file or take photos first.'); return; }
    setUploading(true);
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
      <StatusBar barStyle="dark-content" backgroundColor={T.bgMuted} />

      {/* Top bar (modal-style) */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.iconBtn} onPress={() => router.back()} accessibilityLabel="Close">
          <Icon name="close" size={22} color={T.text} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Upload document</Text>
        <View style={s.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.card}>
          <Text style={s.title}>Upload your document</Text>

          {/* Dashed upload zone */}
          <TouchableOpacity style={s.zone} onPress={handleClickToUpload} activeOpacity={0.75}>
            <View style={s.zoneIconBox}>
              <Icon name="arrow-up" size={20} color={T.blue} />
            </View>
            <View style={s.zoneTextCol}>
              {!hasAttachment ? (
                <>
                  <Text style={s.zoneMain}>
                    Drag and drop or <Text style={s.zoneLink}>click to upload</Text>
                  </Text>
                  <Text style={s.zoneSub}>Max 200MB (PDF, JPEG, PNG)</Text>
                </>
              ) : (
                <>
                  <Text style={s.zoneMain}>
                    {photos.length > 0
                      ? `${photos.length} photo${photos.length !== 1 ? 's' : ''} attached`
                      : fileName}
                  </Text>
                  <Text style={s.zoneLink}>Click to add more</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Photo thumbnails */}
          {photos.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.photoStrip}
              style={{ marginBottom: SPACE.md }}
            >
              {photos.map((uri, i) => (
                <View key={`${uri}-${i}`} style={s.photoThumbWrap}>
                  <Image source={{ uri }} style={s.photoThumb} resizeMode="cover" />
                  <TouchableOpacity style={s.photoRemove} onPress={() => removePhoto(i)}>
                    <Icon name="close" size={10} color="#fff" strokeWidth={2} />
                  </TouchableOpacity>
                  <View style={s.photoBadge}><Text style={s.photoBadgeText}>{i + 1}</Text></View>
                </View>
              ))}
            </ScrollView>
          )}

          {fileUri && (
            <View style={s.fileChip}>
              <Icon name="file" size={18} color={T.textSoft} />
              <Text style={s.fileChipName} numberOfLines={1}>{fileName}</Text>
              <TouchableOpacity
                onPress={() => { setFileUri(null); setFileName(null); }}
                style={s.fileChipRemove}
              >
                <Icon name="close" size={10} color={T.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}

          {/* Fields */}
          <View style={s.row}>
            <View style={s.col}>
              <Text style={s.label}>Document Title</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Rajesh Kumar Claim"
                placeholderTextColor={T.textFaint}
                value={docTitle}
                onChangeText={setDocTitle}
                returnKeyType="done"
              />
            </View>
            <View style={s.col}>
              <Text style={s.label}>Document Language</Text>
              <View style={s.select}>
                <Text style={s.selectText}>English</Text>
                <Icon name="chevron-down" size={16} color={T.textMuted} />
              </View>
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Form Type</Text>
            <View style={s.select}>
              <Text style={s.selectText}>LIC Claim Form</Text>
              <Icon name="chevron-down" size={16} color={T.textMuted} />
            </View>
          </View>

          {/* Actions */}
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
              {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.uploadText}>Upload</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bgMuted },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md,
    backgroundColor: T.bg,
    borderBottomWidth: 1, borderBottomColor: T.borderSoft,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, ...FONT.h3, color: T.text, textAlign: 'center' },

  scroll: { padding: SPACE.lg, paddingTop: SPACE.xl, alignItems: 'center' },

  card: {
    width: '100%', maxWidth: 640,
    backgroundColor: T.bg,
    borderRadius: RADIUS.lg,
    padding: SPACE.xl,
    borderWidth: 1, borderColor: T.borderSoft,
  },
  title: { ...FONT.h2, color: T.text, marginBottom: SPACE.lg },

  zone: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.lg,
    borderWidth: 1.5, borderColor: T.borderStrong, borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACE.lg, paddingHorizontal: SPACE.lg,
    marginBottom: SPACE.lg, minHeight: 100,
  },
  zoneIconBox: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: T.blueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  zoneTextCol: { flex: 1, gap: 4 },
  zoneMain: { ...FONT.bodyStrong, color: T.text },
  zoneLink: { color: T.blue, fontWeight: '600' },
  zoneSub: { ...FONT.small, color: T.textMuted },

  photoStrip: { gap: SPACE.sm, paddingVertical: 4 },
  photoThumbWrap: { position: 'relative' },
  photoThumb: { width: 72, height: 72, borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.border },
  photoRemove: {
    position: 'absolute', top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: T.red, alignItems: 'center', justifyContent: 'center',
  },
  photoBadge: {
    position: 'absolute', bottom: 4, left: 4,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  photoBadgeText: { color: '#fff', ...FONT.tiny, fontWeight: '700' },

  fileChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    backgroundColor: T.bgMuted, borderRadius: RADIUS.md,
    paddingHorizontal: SPACE.md, paddingVertical: 10, marginBottom: SPACE.md,
  },
  fileChipName: { flex: 1, ...FONT.body, color: T.text },
  fileChipRemove: { width: 24, height: 24, borderRadius: 12, backgroundColor: T.border, alignItems: 'center', justifyContent: 'center' },

  row: { flexDirection: 'row', gap: SPACE.md, marginBottom: SPACE.lg },
  col: { flex: 1 },
  field: { marginBottom: SPACE.xl },
  label: { ...FONT.small, fontWeight: '600', color: T.textSoft, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: T.border, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACE.lg, paddingVertical: 12,
    ...FONT.body, color: T.text, backgroundColor: T.bg,
  },
  select: {
    borderWidth: 1, borderColor: T.border, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACE.lg, paddingVertical: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: T.bg,
  },
  selectText: { ...FONT.body, color: T.text },

  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACE.sm, marginTop: 4 },
  cancelBtn: {
    paddingHorizontal: 26, paddingVertical: 11,
    borderRadius: RADIUS.pill, backgroundColor: T.bgMuted,
  },
  cancelText: { ...FONT.bodyStrong, color: T.text },
  uploadBtn: {
    paddingHorizontal: 32, paddingVertical: 11,
    borderRadius: RADIUS.pill, backgroundColor: T.dark,
    alignItems: 'center', justifyContent: 'center', minWidth: 110,
  },
  uploadDisabled: { backgroundColor: T.textFaint },
  uploadText: { color: '#fff', ...FONT.bodyStrong },
});
