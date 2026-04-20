/**
 * Camera — multi-photo capture for LIC documents.
 * Clean Akshar aesthetic, no emojis. Works on both web and native.
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
  Image, Alert, StatusBar, Animated, Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useJobsStore } from '../../store/jobs.store';
import { impact } from '../../utils/haptics';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT } from '../../components/ui/tokens';

// ─── Web fallback (uses <input type=file capture=environment>) ───────────────
function WebCameraScreen({ onPhotos, onCancel }: { onPhotos: (uris: string[]) => void; onCancel: () => void }) {
  const [photos, setPhotos] = useState<string[]>([]);

  const openCamera = useCallback(() => {
    if (Platform.OS !== 'web') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    (input as any).capture = 'environment';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, url]);
    };
    input.click();
  }, []);

  const removePhoto = useCallback((i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const handleDone = useCallback(() => {
    if (photos.length === 0) { Alert.alert('No Photos', 'Take at least one photo first.'); return; }
    onPhotos(photos);
  }, [photos, onPhotos]);

  return (
    <SafeAreaView style={w.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <View style={w.topBar}>
        <TouchableOpacity style={w.iconBtn} onPress={onCancel}>
          <Icon name="close" size={22} color={T.text} />
        </TouchableOpacity>
        <Text style={w.topTitle}>Capture Documents</Text>
        <TouchableOpacity
          style={[w.doneBtnTop, photos.length === 0 && w.doneBtnTopDisabled]}
          onPress={handleDone}
          disabled={photos.length === 0}
        >
          <Text style={[w.doneBtnTopText, photos.length === 0 && { color: T.textFaint }]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={w.scroll} showsVerticalScrollIndicator={false}>
        <Text style={w.heading}>Photograph your LIC document</Text>
        <Text style={w.sub}>Capture each page clearly. All photos group into one upload.</Text>

        {photos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={w.thumbStrip}
            style={{ marginBottom: SPACE.lg }}
          >
            {photos.map((uri, i) => (
              <View key={i} style={w.thumbWrap}>
                <Image source={{ uri }} style={w.thumb} />
                <TouchableOpacity style={w.thumbRemove} onPress={() => removePhoto(i)}>
                  <Icon name="close" size={10} color="#fff" strokeWidth={2} />
                </TouchableOpacity>
                <View style={w.thumbBadge}><Text style={w.thumbBadgeText}>{i + 1}</Text></View>
              </View>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity style={w.captureBtn} onPress={openCamera} activeOpacity={0.75}>
          <View style={w.captureIconBox}>
            <Icon name="camera" size={24} color={T.orange} strokeWidth={1.75} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={w.captureTitle}>
              {photos.length === 0 ? 'Open Camera' : 'Add Another Page'}
            </Text>
            <Text style={w.captureSub}>
              {photos.length === 0 ? 'Take a photo of the document' : `${photos.length} captured · tap to add more`}
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color={T.textMuted} />
        </TouchableOpacity>

        {photos.length > 0 && (
          <TouchableOpacity style={w.continueBtn} onPress={handleDone} activeOpacity={0.88}>
            <Text style={w.continueBtnText}>
              Continue with {photos.length} {photos.length === 1 ? 'page' : 'pages'}
            </Text>
            <Icon name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const w = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.md,
    borderBottomWidth: 1, borderBottomColor: T.borderSoft,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, ...FONT.h3, color: T.text, textAlign: 'center' },
  doneBtnTop: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.pill, backgroundColor: T.dark },
  doneBtnTopDisabled: { backgroundColor: T.bgMuted },
  doneBtnTopText: { color: '#fff', ...FONT.bodyStrong },

  scroll: { padding: SPACE.lg, paddingBottom: SPACE.xxl },
  heading: { ...FONT.h2, color: T.text, marginBottom: 6 },
  sub: { ...FONT.body, color: T.textMuted, marginBottom: SPACE.xl },

  thumbStrip: { gap: SPACE.sm, paddingVertical: 4 },
  thumbWrap: { position: 'relative' },
  thumb: { width: 84, height: 84, borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.border },
  thumbRemove: {
    position: 'absolute', top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: T.red, alignItems: 'center', justifyContent: 'center',
  },
  thumbBadge: {
    position: 'absolute', bottom: 4, left: 4,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  thumbBadgeText: { color: '#fff', ...FONT.tiny, fontWeight: '700' },

  captureBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
    borderWidth: 1.5, borderColor: T.borderStrong, borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACE.lg, paddingVertical: SPACE.lg,
    marginBottom: SPACE.md,
  },
  captureIconBox: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    backgroundColor: T.orangeSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  captureTitle: { ...FONT.h3, color: T.text },
  captureSub: { ...FONT.small, color: T.textMuted, marginTop: 2 },

  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: T.dark, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACE.lg, paddingVertical: 14,
  },
  continueBtnText: { color: '#fff', ...FONT.bodyStrong },
});

// ─── Entry point ─────────────────────────────────────────────────────────────
export default function JobCameraScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const setDraftPhotos = useJobsStore((s) => s.setDraftPhotos);

  const handlePhotos = (uris: string[]) => {
    setDraftPhotos(uris);
    if (returnTo === 'upload') router.back();
    else router.replace('/job/upload');
  };

  if (Platform.OS === 'web') {
    return <WebCameraScreen onPhotos={handlePhotos} onCancel={() => router.back()} />;
  }

  return <NativeCameraScreen router={router} returnTo={returnTo} setDraftPhotos={setDraftPhotos} />;
}

// ─── Native camera ───────────────────────────────────────────────────────────
function NativeCameraScreen({
  router, returnTo, setDraftPhotos,
}: { router: ReturnType<typeof useRouter>; returnTo?: string; setDraftPhotos: (p: string[]) => void }) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<string[]>([]);
  const [capturing, setCapturing] = useState(false);
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const capture = useCallback(async () => {
    if (capturing || !cameraRef.current) return;
    setCapturing(true);
    try {
      impact('Medium');
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 0.8, duration: 60, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]).start();
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        const resized = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 1280 } }],
          { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG }
        );
        setPhotos((prev) => [...prev, resized.uri]);
      }
    } catch {
      Alert.alert('Error', 'Could not capture photo. Please try again.');
    } finally {
      setCapturing(false);
    }
  }, [capturing]);

  const removePhoto = useCallback((index: number) => {
    Alert.alert('Remove Page', 'Remove this page?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setPhotos((p) => p.filter((_, i) => i !== index)) },
    ]);
  }, []);

  const handleDone = useCallback(() => {
    if (photos.length === 0) { Alert.alert('No Photos', 'Capture at least one page first.'); return; }
    setDraftPhotos(photos);
    if (returnTo === 'upload') router.back();
    else router.replace('/job/upload');
  }, [photos, setDraftPhotos, router, returnTo]);

  const handleCancel = useCallback(() => {
    if (photos.length > 0) {
      Alert.alert('Discard Pages?', 'Captured pages will be lost.', [
        { text: 'Keep Shooting', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  }, [photos, router]);

  if (!permission) {
    return (
      <View style={[p.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: T.textMuted }}>Starting camera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={p.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
        <View style={p.topBar}>
          <TouchableOpacity style={p.iconBtn} onPress={() => router.back()}>
            <Icon name="close" size={22} color={T.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={p.content}>
          <View style={p.iconCircle}>
            <Icon name="camera" size={36} color={T.orange} strokeWidth={1.6} />
          </View>
          <Text style={p.title}>Camera Access Needed</Text>
          <Text style={p.desc}>
            Allow camera access to photograph LIC policy documents. Our AI will scan and extract details automatically.
          </Text>

          <View style={p.featList}>
            {[
              'Scan LIC policy documents',
              'AI-powered OCR extraction',
              'Stays private on your device',
            ].map((t) => (
              <View key={t} style={p.featRow}>
                <View style={p.featBullet}>
                  <Icon name="check" size={12} color={T.green} strokeWidth={2.5} />
                </View>
                <Text style={p.featText}>{t}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={p.allowBtn} onPress={requestPermission} activeOpacity={0.85}>
            <Text style={p.allowText}>Allow Camera Access</Text>
            <Icon name="arrow-right" size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={p.uploadLink}
            onPress={() => router.replace('/job/upload')}
            activeOpacity={0.7}
          >
            <Icon name="upload" size={14} color={T.textMuted} />
            <Text style={p.uploadLinkText}>Upload a document instead</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={cam.root}>
      <StatusBar barStyle="light-content" />
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: flashAnim }]}
        pointerEvents="none"
      />

      <SafeAreaView style={cam.topBar}>
        <TouchableOpacity style={cam.cancelBtn} onPress={handleCancel}>
          <Icon name="close" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={cam.countBadge}>
          <Text style={cam.countText}>{photos.length} {photos.length === 1 ? 'page' : 'pages'}</Text>
        </View>
        <TouchableOpacity
          style={[cam.doneBtn, photos.length === 0 && cam.doneBtnDisabled]}
          onPress={handleDone}
          disabled={photos.length === 0}
        >
          <Text style={[cam.doneText, photos.length === 0 && { color: 'rgba(255,255,255,0.5)' }]}>Done</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <View style={[cam.guideFrame, { pointerEvents: 'none' } as any]}>
        <View style={[cam.corner, cam.cornerTL]} />
        <View style={[cam.corner, cam.cornerTR]} />
        <View style={[cam.corner, cam.cornerBL]} />
        <View style={[cam.corner, cam.cornerBR]} />
      </View>

      <View style={cam.bottomArea}>
        {photos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cam.thumbStrip}>
            {photos.map((uri, i) => (
              <TouchableOpacity key={i} onLongPress={() => removePhoto(i)} activeOpacity={0.85} style={cam.thumbWrap}>
                <Image source={{ uri }} style={cam.thumb} />
                <View style={cam.thumbBadge}><Text style={cam.thumbBadgeText}>{i + 1}</Text></View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={cam.hint}>Tap shutter to photograph the document</Text>
        )}
        <TouchableOpacity
          style={[cam.shutter, capturing && { opacity: 0.5 }]}
          onPress={capture}
          disabled={capturing}
          activeOpacity={0.8}
        >
          <View style={cam.shutterInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Permission screen styles ─────────────────────────────────────────────────
const p = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.md,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  content: { padding: SPACE.xl, alignItems: 'center' },

  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: T.orangeSoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACE.xl,
  },
  title: { ...FONT.h1, color: T.text, textAlign: 'center', marginBottom: 10 },
  desc: { ...FONT.body, color: T.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: SPACE.xl, maxWidth: 320 },

  featList: { width: '100%', maxWidth: 360, marginBottom: SPACE.xl, gap: SPACE.sm },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  featBullet: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: T.greenSoft, alignItems: 'center', justifyContent: 'center',
  },
  featText: { ...FONT.body, color: T.textSoft, flex: 1 },

  allowBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.dark, borderRadius: RADIUS.pill,
    paddingHorizontal: 24, paddingVertical: 14,
    marginBottom: SPACE.md,
  },
  allowText: { color: '#fff', ...FONT.bodyStrong },
  uploadLink: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
  uploadLinkText: { ...FONT.small, color: T.textMuted },
});

// ─── Native camera overlay styles ─────────────────────────────────────────────
const SHUTTER = 76;
const CORNER = 24;
const BORDER = 3;

const cam = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
  },
  cancelBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  countBadge: { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  countText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  doneBtn: { backgroundColor: T.orange, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  doneBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.25)' },
  doneText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  guideFrame: { position: 'absolute', top: '20%', left: '8%', right: '8%', bottom: '28%' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: 'rgba(255,255,255,0.75)' },
  cornerTL: { top: 0, left: 0, borderTopWidth: BORDER, borderLeftWidth: BORDER, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: BORDER, borderRightWidth: BORDER, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: BORDER, borderLeftWidth: BORDER, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER, borderBottomRightRadius: 4 },

  bottomArea: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingBottom: 40, alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', paddingTop: 12,
  },
  thumbStrip: { paddingHorizontal: 16, gap: 10, paddingBottom: 8 },
  thumbWrap: { position: 'relative' },
  thumb: { width: 64, height: 64, borderRadius: 10, borderWidth: 2, borderColor: '#fff' },
  thumbBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1,
  },
  thumbBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 12, marginTop: 4 },
  shutter: {
    width: SHUTTER, height: SHUTTER, borderRadius: SHUTTER / 2,
    backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 3, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  shutterInner: { width: SHUTTER - 18, height: SHUTTER - 18, borderRadius: (SHUTTER - 18) / 2, backgroundColor: '#fff' },
});
