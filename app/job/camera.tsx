import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useJobsStore } from '../../store/jobs.store';

const { height: SCREEN_H } = Dimensions.get('window');
import { getSarvamLogoUri, getSarvamLogoGradientUri } from '../../assets/sarvam-logo';

const HERO_COLORS = ['#040810', '#0a1530', '#142660', '#1e4090', '#4878c8', '#a8c4e8', '#ddb890', '#e87828'] as const;
const HERO_LOCS = [0, 0.12, 0.25, 0.40, 0.56, 0.70, 0.84, 1] as const;

// ── Web camera: uses <input type="file" capture> — works on HTTP, no permissions hang ──
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
    <View style={w.root}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={HERO_COLORS} locations={HERO_LOCS} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={w.hero}>
        <SafeAreaView style={w.heroInner}>
          <Image source={{ uri: getSarvamLogoGradientUri() }} style={w.logo} resizeMode="contain" />
          <Text style={w.heroTitle}>Scan Document</Text>
          <Text style={w.heroSub}>Take photos of LIC policy documents</Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={w.card}>
        <View style={w.cardHandle} />
        <ScrollView contentContainerStyle={w.panel} showsVerticalScrollIndicator={false}>
          {photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }} contentContainerStyle={{ gap: 10, paddingHorizontal: 4 }}>
              {photos.map((uri, i) => (
                <TouchableOpacity key={i} onLongPress={() => removePhoto(i)} style={{ position: 'relative' }}>
                  <Image source={{ uri }} style={w.thumb} />
                  <View style={w.thumbBadge}><Text style={w.thumbBadgeText}>{i + 1}</Text></View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={w.cameraBtn} onPress={openCamera} activeOpacity={0.85}>
            <Text style={w.cameraBtnIcon}>📷</Text>
            <Text style={w.cameraBtnText}>{photos.length === 0 ? 'Open Camera' : 'Add Another Photo'}</Text>
          </TouchableOpacity>

          {photos.length > 0 && (
            <TouchableOpacity style={w.doneBtn} onPress={handleDone} activeOpacity={0.88}>
              <Text style={w.doneBtnText}>Continue with {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}</Text>
              <View style={w.doneArrow}><Text style={{ color: '#fff', fontSize: 16 }}>→</Text></View>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={w.cancelLink} onPress={onCancel}>
            <Text style={w.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const w = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#e87828' },
  hero: { height: Math.round(SCREEN_H * 0.40) },
  heroInner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 8 },
  logo: { width: 100, height: 100 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginTop: 14 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 6, textAlign: 'center', paddingHorizontal: 32 },
  card: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, elevation: 12 },
  cardHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  panel: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 },
  thumb: { width: 80, height: 80, borderRadius: 12, borderWidth: 2, borderColor: '#E0E0E0' },
  thumbBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  thumbBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cameraBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 16, borderStyle: 'dashed',
    paddingVertical: 24, marginBottom: 16,
  },
  cameraBtnIcon: { fontSize: 28 },
  cameraBtnText: { fontSize: 17, fontWeight: '600', color: '#333' },
  doneBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#111', borderRadius: 16, paddingHorizontal: 22, paddingVertical: 18, marginBottom: 12,
  },
  doneBtnText: { fontSize: 16, color: '#fff', fontWeight: '700' },
  doneArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  cancelLink: { alignItems: 'center', paddingVertical: 14 },
  cancelLinkText: { fontSize: 15, color: '#999' },
});

export default function JobCameraScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const setDraftPhotos = useJobsStore((s) => s.setDraftPhotos);

  const handlePhotos = (uris: string[]) => {
    setDraftPhotos(uris);
    if (returnTo === 'upload') {
      router.back();
    } else {
      router.replace('/job/scan');
    }
  };

  if (Platform.OS === 'web') {
    return (
      <WebCameraScreen
        onPhotos={handlePhotos}
        onCancel={() => router.back()}
      />
    );
  }

  return <NativeCameraScreen router={router} returnTo={returnTo} setDraftPhotos={setDraftPhotos} />;
}

function NativeCameraScreen({ router, returnTo, setDraftPhotos }: { router: ReturnType<typeof useRouter>; returnTo?: string; setDraftPhotos: (photos: string[]) => void }) {
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 0.8, duration: 60, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]).start();
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, base64: false });
      if (photo?.uri) {
        const resized = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 1280 } }],
          { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG }
        );
        setPhotos((prev) => [...prev, resized.uri]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Alert.alert('Error', 'Could not capture photo. Please try again.');
    } finally {
      setCapturing(false);
    }
  }, [capturing]);

  const removePhoto = useCallback((index: number) => {
    Alert.alert('Remove Photo', 'Remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setPhotos((p) => p.filter((_, i) => i !== index)) },
    ]);
  }, []);

  const handleDone = useCallback(() => {
    if (photos.length === 0) {
      Alert.alert('No Photos', 'Take at least one photo first.');
      return;
    }
    setDraftPhotos(photos);
    if (returnTo === 'upload') {
      router.back();
    } else {
      router.push('/job/scan');
    }
  }, [photos, setDraftPhotos, router, returnTo]);

  const handleCancel = useCallback(() => {
    if (photos.length > 0) {
      Alert.alert('Discard Photos?', 'Your captured photos will be lost.', [
        { text: 'Keep Shooting', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  }, [photos, router]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={p.root}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <LinearGradient colors={HERO_COLORS} locations={HERO_LOCS} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={p.centerBox}>
          <Image source={{ uri: getSarvamLogoGradientUri() }} style={p.logo} resizeMode="contain" />
          <Text style={p.loadingText}>Starting camera…</Text>
        </View>
      </View>
    );
  }

  // ── Permission screen ─────────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <View style={p.root}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Smooth gradient hero */}
        <LinearGradient colors={HERO_COLORS} locations={HERO_LOCS} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={p.hero}>
          <SafeAreaView style={p.heroInner}>
            <Image
              source={{ uri: getSarvamLogoGradientUri() }}
              style={p.logo}
              resizeMode="contain"
            />
          </SafeAreaView>
        </LinearGradient>

        {/* White panel — scrollable */}
        <ScrollView
          style={p.panel}
          contentContainerStyle={p.panelContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Brand */}
          <View style={p.brandRow}>
            <Text style={p.brand}>sarvam</Text>
            <View style={p.licBadge}>
              <Text style={p.licBadgeText}>for LIC</Text>
            </View>
          </View>

          {/* Heading */}
          <Text style={p.headline}>Camera{'\n'}Access Needed</Text>
          <Text style={p.sub}>
            Allow camera access to photograph LIC policy documents. Our AI will scan and extract
            policy details automatically.
          </Text>

          {/* Feature list */}
          {[
            { icon: '📄', text: 'Scan LIC policy documents' },
            { icon: '✦', text: 'AI-powered OCR extraction' },
            { icon: '🔒', text: 'Stays private on your device' },
          ].map((f) => (
            <View key={f.icon} style={p.featureRow}>
              <Text style={p.featureIcon}>{f.icon}</Text>
              <Text style={p.featureText}>{f.text}</Text>
            </View>
          ))}

          {/* Primary button */}
          <TouchableOpacity style={p.allowBtn} onPress={requestPermission} activeOpacity={0.85}>
            <Text style={p.allowText}>Allow Camera Access</Text>
            <Text style={p.allowArrow}>→</Text>
          </TouchableOpacity>

          {/* Secondary link */}
          <TouchableOpacity style={p.uploadLink} onPress={() => router.replace('/job/upload')} activeOpacity={0.7}>
            <Text style={p.uploadLinkText}>↑  Upload a document instead</Text>
          </TouchableOpacity>

          {/* Footer brand mark */}
          <View style={p.footer}>
            <Text style={p.footerText}>LIC Field Agent · Powered by Sarvam AI</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Camera ────────────────────────────────────────────────────────────────
  return (
    <View style={cam.root}>
      <StatusBar barStyle="light-content" />
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: flashAnim }]}
        pointerEvents="none"
      />

      {/* Top bar */}
      <SafeAreaView style={cam.topBar}>
        <TouchableOpacity style={cam.cancelBtn} onPress={handleCancel}>
          <Text style={cam.cancelText}>✕</Text>
        </TouchableOpacity>
        <View style={cam.countBadge}>
          <Text style={cam.countText}>{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</Text>
        </View>
        <TouchableOpacity style={cam.uploadBtn} onPress={() => router.replace('/job/upload')}>
          <Text style={cam.uploadBtnText}>↑ Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[cam.doneBtn, photos.length === 0 && cam.doneBtnDisabled]}
          onPress={handleDone}
          disabled={photos.length === 0}
        >
          <Text style={[cam.doneText, photos.length === 0 && cam.doneTextDisabled]}>Done</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Corner guides */}
      <View style={[cam.guideFrame, { pointerEvents: 'none' } as any]}>
        <View style={[cam.corner, cam.cornerTL]} />
        <View style={[cam.corner, cam.cornerTR]} />
        <View style={[cam.corner, cam.cornerBL]} />
        <View style={[cam.corner, cam.cornerBR]} />
      </View>

      {/* Bottom */}
      <View style={cam.bottomArea}>
        {photos.length > 0 ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cam.thumbStrip}>
              {photos.map((uri, i) => (
                <TouchableOpacity key={`${i}`} onLongPress={() => removePhoto(i)} activeOpacity={0.85} style={cam.thumbWrap}>
                  <Image source={{ uri }} style={cam.thumb} />
                  <View style={cam.thumbBadge}>
                    <Text style={cam.thumbBadgeText}>{i + 1}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={cam.hint}>Long-press thumbnail to remove</Text>
          </>
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

// ── Permission screen styles ───────────────────────────────────────────────
const p = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  hero: { height: Math.round(SCREEN_H * 0.38) },
  heroInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { alignItems: 'center', justifyContent: 'center' },
  logo: { width: 110, height: 109 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginTop: 16 },

  panel: { flex: 1, backgroundColor: '#FFFFFF' },
  panelContent: { paddingHorizontal: 28, paddingTop: 28, paddingBottom: 48 },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  brand: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5 },
  licBadge: { backgroundColor: '#FBE8D9', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  licBadgeText: { fontSize: 12, color: '#E8612A', fontWeight: '700' },

  headline: { fontSize: 36, fontWeight: '800', color: '#1A1A1A', lineHeight: 44, marginBottom: 14, letterSpacing: -1 },
  sub: { fontSize: 15, color: '#666', lineHeight: 24, marginBottom: 28 },

  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  featureIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  featureText: { fontSize: 15, color: '#333', flex: 1 },

  allowBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1A1A1A', borderRadius: 16,
    paddingHorizontal: 24, paddingVertical: 18, marginTop: 24, marginBottom: 12,
  },
  allowText: { fontSize: 16, color: '#fff', fontWeight: '700' },
  allowArrow: { fontSize: 20, color: '#fff' },

  uploadLink: { alignItems: 'center', paddingVertical: 14 },
  uploadLinkText: { fontSize: 15, color: '#888' },

  footer: { marginTop: 24, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#BBBBBB', letterSpacing: 0.3 },
});

// ── Camera screen styles ───────────────────────────────────────────────────
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
  cancelText: { color: '#fff', fontSize: 20, fontWeight: '300' },
  countBadge: { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  countText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  uploadBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  uploadBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  doneBtn: { backgroundColor: '#E8612A', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  doneBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.25)' },
  doneText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  doneTextDisabled: { color: 'rgba(255,255,255,0.5)' },
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
