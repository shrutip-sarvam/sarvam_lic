/**
 * Home — the Upload Document dialog is the main page (per Akshar design).
 * Clicking the dashed zone opens a choice: Camera scan, or Upload from device.
 * After upload, processing runs, then the form is filled, then back here.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Image, Alert, ActivityIndicator,
  ScrollView, Platform, Modal, Pressable, FlatList,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useFocusEffect } from 'expo-router';
import { useJobsStore, type Job } from '../../store/jobs.store';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT } from '../../components/ui/tokens';

export default function HomeUploadScreen() {
  const router = useRouter();
  const {
    draftPhotoUris, setDraftPhotos, setDraftMeta, jobs,
  } = useJobsStore();

  const [photos, setPhotos] = useState<string[]>([]);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Pull in photos captured from camera screen on focus
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

  const openCamera = useCallback(() => {
    setPickerOpen(false);
    router.push('/job/camera?returnTo=upload');
  }, [router]);

  const openDevice = useCallback(async () => {
    setPickerOpen(false);

    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png,image/jpeg,application/pdf,application/zip';
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

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png', 'application/zip'],
        copyToCacheDirectory: true, multiple: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const imgs: string[] = [];
        for (const a of result.assets) {
          if (a.mimeType?.startsWith('image/')) imgs.push(a.uri);
          else { setFileUri(a.uri); setFileName(a.name); }
        }
        if (imgs.length > 0) setPhotos((p) => [...p, ...imgs]);
      }
    } catch {
      Alert.alert('Error', 'Could not open file picker.');
    }
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
  }, []);

  const allUris = photos.length > 0 ? photos : fileUri ? [fileUri] : [];
  const canUpload = allUris.length > 0;

  const handleUpload = useCallback(() => {
    if (!canUpload) { setPickerOpen(true); return; }
    setUploading(true);
    setDraftPhotos(allUris);
    setDraftMeta(docTitle.trim() || 'Untitled Document', false);
    // Reset form before navigating
    setTimeout(() => {
      setPhotos([]); setFileUri(null); setFileName(null); setDocTitle('');
      setUploading(false);
      router.push('/job/scan');
    }, 200);
  }, [canUpload, allUris, docTitle, setDraftPhotos, setDraftMeta, router]);

  const handleCancel = useCallback(() => {
    setPhotos([]); setFileUri(null); setFileName(null); setDocTitle('');
  }, []);

  const hasAttachment = photos.length > 0 || !!fileUri;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bgMuted} />

      {/* Top bar */}
      <View style={s.topBar}>
        <View style={s.brandRow}>
          <Text style={s.brand}>sarvam</Text>
          <View style={s.licBadge}><Text style={s.licBadgeText}>for LIC</Text></View>
        </View>
        <TouchableOpacity style={s.avatar}>
          <Text style={s.avatarText}>A</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Upload card (exact match to screenshot) ───────────────────── */}
        <View style={s.card}>
          <Text style={s.title}>Upload your document</Text>

          <TouchableOpacity
            style={s.zone}
            onPress={() => setPickerOpen(true)}
            activeOpacity={0.75}
          >
            <View style={s.zoneIconBox}>
              <Icon name="arrow-up" size={20} color="#6366F1" />
            </View>
            <View style={s.zoneTextCol}>
              {!hasAttachment ? (
                <>
                  <Text style={s.zoneMain}>
                    Drag and drop or <Text style={s.zoneLink}>click to upload</Text>
                  </Text>
                  <Text style={s.zoneSub}>Max 200MB (PDF, ZIP, JPEG, PNG)</Text>
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

          {/* Thumbnails */}
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

          {/* Two-column fields */}
          <View style={s.row}>
            <View style={s.col}>
              <Text style={s.label}>Document Title</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Mahabharath"
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
              <Text style={s.selectText}>LIC Proposal Form</Text>
              <Icon name="chevron-down" size={16} color={T.textMuted} />
            </View>
          </View>

          <View style={s.actions}>
            <TouchableOpacity style={s.cancelBtn} onPress={handleCancel} activeOpacity={0.75}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.uploadBtn, !canUpload && s.uploadDisabled]}
              onPress={handleUpload}
              disabled={uploading}
              activeOpacity={0.88}
            >
              {uploading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={s.uploadText}>Upload</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Optional: recent uploads list (subtle, below card) ────────── */}
        {jobs.length > 0 && (
          <View style={s.recentSection}>
            <View style={s.recentHeader}>
              <Text style={s.recentTitle}>Recent uploads</Text>
              <Text style={s.recentCount}>{jobs.length}</Text>
            </View>
            <FlatList
              data={jobs.slice(0, 10)}
              keyExtractor={(j) => j.id}
              renderItem={({ item }) => <RecentRow job={item} />}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />
          </View>
        )}

        <View style={{ height: SPACE.xxl }} />
      </ScrollView>

      {/* ── Picker modal (Camera / Device) ─────────────────────────────── */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={s.modalBack} onPress={() => setPickerOpen(false)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Add document</Text>
            <Text style={s.modalSub}>Choose how to upload your LIC document</Text>

            <TouchableOpacity style={s.modalOption} onPress={openCamera} activeOpacity={0.85}>
              <View style={[s.modalIcon, { backgroundColor: T.orangeSoft }]}>
                <Icon name="camera" size={22} color={T.orange} strokeWidth={1.75} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.modalOptionTitle}>Scan with Camera</Text>
                <Text style={s.modalOptionSub}>Capture multiple pages, group them</Text>
              </View>
              <Icon name="chevron-right" size={18} color={T.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={s.modalOption} onPress={openDevice} activeOpacity={0.85}>
              <View style={[s.modalIcon, { backgroundColor: T.blueSoft }]}>
                <Icon name="upload" size={22} color={T.blue} strokeWidth={1.75} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.modalOptionTitle}>Upload from Device</Text>
                <Text style={s.modalOptionSub}>PDF, ZIP, JPEG, PNG up to 200MB</Text>
              </View>
              <Icon name="chevron-right" size={18} color={T.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={s.modalCancel}
              onPress={() => setPickerOpen(false)}
              activeOpacity={0.7}
            >
              <Text style={s.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Recent row ──────────────────────────────────────────────────────────────
function RecentRow({ job }: { job: Job }) {
  const date = new Date(job.createdAt);
  const dateLabel = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const title = job.holderName?.trim() || job.docTitle?.trim() || 'Untitled';
  return (
    <View style={r.row}>
      {job.photoUris.length > 0 ? (
        <Image source={{ uri: job.photoUris[0] }} style={r.thumb} />
      ) : (
        <View style={[r.thumb, r.thumbPlaceholder]}>
          <Icon name="file" size={16} color={T.textMuted} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={r.title} numberOfLines={1}>{title}</Text>
        <Text style={r.sub} numberOfLines={1}>
          LIC Proposal Form · {dateLabel}
          {job.photoUris.length > 1 ? ` · ${job.photoUris.length} pages` : ''}
        </Text>
      </View>
      <View style={r.statusPill}>
        <Text style={r.statusText}>{job.status}</Text>
      </View>
    </View>
  );
}
const r = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
    backgroundColor: T.bg, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: T.borderSoft,
    padding: SPACE.sm,
  },
  thumb: { width: 40, height: 50, borderRadius: 6, backgroundColor: T.bgMuted },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  title: { ...FONT.bodyStrong, color: T.text },
  sub: { ...FONT.tiny, color: T.textMuted, marginTop: 2 },
  statusPill: {
    backgroundColor: T.bgMuted, borderRadius: RADIUS.sm,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  statusText: { ...FONT.tiny, color: T.textSoft, fontWeight: '600' },
});

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bgMuted },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md,
    backgroundColor: T.bg,
    borderBottomWidth: 1, borderBottomColor: T.borderSoft,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  brand: { fontSize: 22, fontWeight: '800', color: T.text, letterSpacing: -0.6 },
  licBadge: {
    backgroundColor: T.orangeSoft, borderRadius: RADIUS.pill,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  licBadgeText: { ...FONT.tiny, color: T.orangeText, fontWeight: '700' },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.bgMuted, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...FONT.bodyStrong, color: T.text },

  scroll: { padding: SPACE.lg, paddingTop: SPACE.xl, alignItems: 'center' },

  card: {
    width: '100%', maxWidth: 720,
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
    backgroundColor: '#EEEEFE',
    alignItems: 'center', justifyContent: 'center',
  },
  zoneTextCol: { flex: 1, gap: 4 },
  zoneMain: { ...FONT.bodyStrong, color: T.text, fontSize: 15 },
  zoneLink: { color: '#6366F1', fontWeight: '600' },
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

  recentSection: { width: '100%', maxWidth: 720, marginTop: SPACE.lg },
  recentHeader: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    marginBottom: SPACE.sm, paddingHorizontal: 4,
  },
  recentTitle: { ...FONT.h3, color: T.text },
  recentCount: { ...FONT.small, color: T.textMuted },

  // Modal (picker)
  modalBack: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: T.bg,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: SPACE.lg, paddingTop: SPACE.sm, paddingBottom: SPACE.xxl,
    gap: SPACE.sm,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: T.border, alignSelf: 'center',
    marginBottom: SPACE.md,
  },
  modalTitle: { ...FONT.h2, color: T.text, marginBottom: 2 },
  modalSub: { ...FONT.small, color: T.textMuted, marginBottom: SPACE.md },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
    borderWidth: 1, borderColor: T.border,
    borderRadius: RADIUS.lg, padding: SPACE.md,
  },
  modalIcon: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  modalOptionTitle: { ...FONT.h3, color: T.text },
  modalOptionSub: { ...FONT.small, color: T.textMuted, marginTop: 2 },
  modalCancel: {
    paddingVertical: 14, alignItems: 'center', marginTop: SPACE.sm,
  },
  modalCancelText: { ...FONT.bodyStrong, color: T.textMuted },
});
