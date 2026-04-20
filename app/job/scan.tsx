import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { useJobsStore, type ExtractedData } from '../../store/jobs.store';
import { SARVAM_MONOGRAM_BLACK, SARVAM_WORDMARK_BLACK } from '../../assets/sarvam-logo';

// ─── Extractors ───────────────────────────────────────────────────────────────

function extractPolicyNumber(text: string): string {
  const patterns = [
    /policy\s*(?:no|number|#)[.:\s]*([A-Z0-9\-]{6,20})/i,
    /(?:^|\s)([0-9]{9,12})(?:\s|$)/m,
    /P[0-9]{8,12}/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return '';
}

function extractHolderName(text: string): string {
  const patterns = [
    /(?:life\s+assured|policyholder|insured|name\s+of)[:\s]+([A-Z][a-zA-Z\s]{2,40})/i,
    /(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Z][a-zA-Z\s]{2,30})/,
    /name[:\s]+([A-Z][a-zA-Z\s]{2,40})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return m[1].trim().replace(/\s+/g, ' ');
  }
  return '';
}

function extractSumAssured(text: string): string {
  const patterns = [
    /sum\s+assured[:\s₹Rs.]*([0-9,]+)/i,
    /basic\s+sum[:\s₹Rs.]*([0-9,]+)/i,
    /(?:₹|Rs\.?)\s*([0-9,]{4,})/,
    /([0-9,]{5,})\s*(?:rupees|only)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return '₹' + m[1].replace(/,/g, '').trim();
  }
  return '';
}

async function readBase64(uri: string): Promise<string> {
  if (uri.startsWith('data:')) return uri.split(',')[1] ?? '';
  try {
    return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  } catch {
    return '';
  }
}

async function scanImageWithVision(base64: string, handwritten = false): Promise<string> {
  const apiBase = process.env.EXPO_PUBLIC_SARVAM_API_BASE_URL ?? 'https://api.sarvam.ai';
  const apiKey = process.env.EXPO_PUBLIC_SARVAM_API_KEY ?? '';
  if (!apiKey || apiKey === 'your_api_key_here') {
    await new Promise(r => setTimeout(r, 1200));
    return 'POLICY NO: 123456789\nNAME: Sample Policyholder\nSUM ASSURED: Rs. 5,00,000\nLIC of India Policy Document';
  }
  try {
    const res = await fetch(`${apiBase}/v1/vision/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-subscription-key': apiKey },
      body: JSON.stringify({ image: base64, mime_type: 'image/jpeg', target_language: 'en-IN', extract_structure: true, handwritten }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data?.raw_text ?? data?.blocks?.map((b: any) => b.text).join('\n') ?? '';
  } catch {
    return '';
  }
}

// ─── Sarvam tokens ────────────────────────────────────────────────────────────
const T = {
  bg: '#FFFFFF', text: '#1A1A1A', muted: '#9A9A9A',
  border: '#EBEBEB', peach: '#FBE8D9', peachText: '#7A3A18',
  orange: '#E8612A', navy: '#1A3B6E',
};

// ─── Pulsing mandala ─────────────────────────────────────────────────────────

function PulsingMandala({ active }: { active: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) { pulse.setValue(1); return; }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [active]);

  const count = 8;
  const size = 52;
  const r = Math.floor(size / 2);
  const petalR = Math.floor(r * 0.22);
  const dist = r * 0.55;

  return (
    <Animated.View style={{ transform: [{ scale: pulse }], width: size, height: size }}>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2;
        const left = Math.round(r + Math.cos(a) * dist - petalR);
        const top = Math.round(r + Math.sin(a) * dist - petalR);
        return (
          <View key={i} style={{
            position: 'absolute',
            left,
            top,
            width: petalR * 2, height: petalR * 2,
            borderRadius: petalR, borderWidth: 1.5, borderColor: T.orange,
          }} />
        );
      })}
      <View style={{
        position: 'absolute',
        left: r - Math.floor(r * 0.3),
        top: r - Math.floor(r * 0.3),
        width: Math.floor(r * 0.6),
        height: Math.floor(r * 0.6),
        borderRadius: Math.floor(r * 0.3),
        borderWidth: 1.5, borderColor: T.orange,
      }} />
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ScanProcessingScreen() {
  const router = useRouter();
  const { draftPhotoUris, draftHandwritten, setDraftExtracted } = useJobsStore();
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Reading document…');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    processAll();
  }, []);

  const processAll = async () => {
    const allText: string[] = [];
    for (let i = 0; i < draftPhotoUris.length; i++) {
      setCurrent(i + 1);
      setStatusMsg(`Scanning photo ${i + 1} of ${draftPhotoUris.length}…`);
      const b64 = await readBase64(draftPhotoUris[i]);
      if (b64) {
        const text = await scanImageWithVision(b64, draftHandwritten);
        if (text) allText.push(text);
      }
    }
    setStatusMsg('Extracting policy details…');
    const combined = allText.join('\n\n');
    const extracted: ExtractedData = {
      policyNumber: extractPolicyNumber(combined),
      holderName: extractHolderName(combined),
      sumAssured: extractSumAssured(combined),
      rawText: combined,
    };
    setDraftExtracted(extracted);
    setStatusMsg('Done! Opening form…');
    setDone(true);
    setTimeout(() => router.replace('/job/form'), 700);
  };

  const total = draftPhotoUris.length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Sarvam header */}
      <View style={s.header}>
        <Text style={s.menu}>≡</Text>
        <Image source={SARVAM_MONOGRAM_BLACK} style={s.mark} resizeMode="contain" />
        <Image source={SARVAM_WORDMARK_BLACK} style={s.brand} resizeMode="contain" />
        <View style={s.badge}><Text style={s.badgeText}>LIC ↓</Text></View>
      </View>

      {/* "Message bubble" showing current photo */}
      <View style={s.content}>
        {draftPhotoUris[current - 1] && !done ? (
          <View style={s.bubbleRow}>
            <View style={s.bubble}>
              <Text style={s.bubbleLabel}>Scanning document {current} of {total}</Text>
              <Image source={{ uri: draftPhotoUris[current - 1] }} style={s.thumb} resizeMode="cover" />
            </View>
          </View>
        ) : null}

        {/* "Reasoning" row — Sarvam style */}
        <View style={s.reasoningRow}>
          <PulsingMandala active={!done} />
          <View style={s.reasoningText}>
            <Text style={s.reasoningLabel}>{done ? 'Extraction complete' : 'Reasoning'}</Text>
            <Text style={s.reasoningStatus}>{statusMsg}</Text>
          </View>
        </View>

        {/* Progress dots */}
        {total > 1 && (
          <View style={s.dots}>
            {draftPhotoUris.map((_, i) => (
              <View key={i} style={[s.dot, i < current ? s.dotDone : s.dotPending]} />
            ))}
          </View>
        )}
      </View>

      {/* Bottom bar (same Sarvam style, disabled) */}
      <View style={s.bottomBar}>
        <Text style={s.bottomPlus}>+</Text>
        <View style={s.bottomInput}>
          <Text style={s.bottomHint}>Processing your documents…</Text>
        </View>
        <View style={[s.orb, { backgroundColor: '#1A3B6E', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 3 }]}>
          {[8, 14, 10, 16, 9].map((h, i) => (
            <View key={i} style={{ width: 2.5, height: h, borderRadius: 2, backgroundColor: '#fff', opacity: 0.8 }} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: T.border, gap: 10,
  },
  menu: { fontSize: 20, color: T.text },
  mark: { width: 24, height: 24 },
  brand: { width: 80, height: 22 },
  badge: { backgroundColor: '#F0F0F0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, color: T.muted, fontWeight: '600' },

  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  bubbleRow: { marginBottom: 16 },
  bubble: {
    backgroundColor: T.peach, borderRadius: 18, borderTopLeftRadius: 4,
    padding: 14,
  },
  bubbleLabel: { fontSize: 12, color: T.peachText, opacity: 0.7, marginBottom: 10 },
  thumb: { width: '100%', height: 180, borderRadius: 12 },

  reasoningRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 16,
  },
  reasoningText: { flex: 1 },
  reasoningLabel: { fontSize: 16, fontWeight: '600', color: T.orange, marginBottom: 2 },
  reasoningStatus: { fontSize: 13, color: T.muted },

  dots: { flexDirection: 'row', gap: 8, marginTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotDone: { backgroundColor: T.orange },
  dotPending: { backgroundColor: T.border },

  bottomBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: T.border, gap: 10,
  },
  bottomPlus: { fontSize: 22, color: T.muted, width: 36, textAlign: 'center' },
  bottomInput: {
    flex: 1, backgroundColor: '#F7F5F2', borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  bottomHint: { fontSize: 15, color: T.muted },
  orb: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
});
