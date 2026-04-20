/**
 * Scan Processing — runs Sarvam Vision API on captured photos.
 * Clean Akshar-style progress UI: thin progress bar, current page thumbnail,
 * step label. No emojis, no heavy animations.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, Image,
  ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { useJobsStore, type ExtractedData } from '../../store/jobs.store';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT } from '../../components/ui/tokens';

// ─── Extractors ───────────────────────────────────────────────────────────────
function extractPolicyNumber(text: string): string {
  const patterns = [
    /policy\s*(?:no|number|#)[.:\s]*([A-Z0-9-]{6,20})/i,
    /(?:^|\s)([0-9]{9,12})(?:\s|$)/m,
    /P[0-9]{8,12}/i,
  ];
  for (const p of patterns) { const m = text.match(p); if (m?.[1]) return m[1].trim(); }
  return '';
}
function extractHolderName(text: string): string {
  const patterns = [
    /(?:life\s+assured|policyholder|insured|name\s+of)[:\s]+([A-Z][a-zA-Z\s]{2,40})/i,
    /(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Z][a-zA-Z\s]{2,30})/,
    /name[:\s]+([A-Z][a-zA-Z\s]{2,40})/i,
  ];
  for (const p of patterns) { const m = text.match(p); if (m?.[1]) return m[1].trim().replace(/\s+/g, ' '); }
  return '';
}
function extractSumAssured(text: string): string {
  const patterns = [
    /sum\s+assured[:\s₹Rs.]*([0-9,]+)/i,
    /basic\s+sum[:\s₹Rs.]*([0-9,]+)/i,
    /(?:₹|Rs\.?)\s*([0-9,]{4,})/,
  ];
  for (const p of patterns) { const m = text.match(p); if (m?.[1]) return '₹' + m[1].replace(/,/g, '').trim(); }
  return '';
}

async function readBase64(uri: string): Promise<string> {
  if (uri.startsWith('data:')) return uri.split(',')[1] ?? '';
  if (Platform.OS === 'web' && uri.startsWith('blob:')) {
    try {
      const res = await fetch(uri);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(((reader.result as string) ?? '').split(',')[1] ?? '');
        reader.readAsDataURL(blob);
      });
    } catch { return ''; }
  }
  try {
    return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  } catch { return ''; }
}

async function scanImageWithVision(
  _base64: string,
  _handwritten = false,
  _targetLanguage = 'en-IN',
): Promise<string> {
  // Demo build: uses a deterministic mock extraction.
  // Wire a real Vision endpoint here when running against a live backend.
  await new Promise((r) => setTimeout(r, 600));
  return 'POLICY NO: 123456789\nLife Assured: Rajesh Kumar\nSum Assured: Rs. 5,00,000\nLIC of India Policy Document';
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ScanProcessingScreen() {
  const router = useRouter();
  const { draftPhotoUris, draftHandwritten, draftLanguage, setDraftExtracted } = useJobsStore();
  const [current, setCurrent] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Reading document');
  const [done, setDone] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const processAll = async () => {
      const allText: string[] = [];
      for (let i = 0; i < draftPhotoUris.length; i++) {
        setCurrent(i + 1);
        setStatusMsg(`Scanning page ${i + 1} of ${draftPhotoUris.length}`);
        const b64 = await readBase64(draftPhotoUris[i]);
        if (b64) {
          const text = await scanImageWithVision(b64, draftHandwritten, draftLanguage);
          if (text) allText.push(text);
        }
      }
      setStatusMsg('Extracting claim details');
      const combined = allText.join('\n\n');
      const extracted: ExtractedData = {
        policyNumber: extractPolicyNumber(combined),
        holderName: extractHolderName(combined),
        sumAssured: extractSumAssured(combined),
        rawText: combined,
      };
      setDraftExtracted(extracted);
      setDone(true);
      setTimeout(() => router.replace('/job/form'), 350);
    };

    processAll();
  }, []);

  const total = draftPhotoUris.length;
  const progress = total > 0 ? current / total : 0;
  const currentPhoto = draftPhotoUris[current - 1];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Top bar */}
      <View style={s.topBar}>
        <View style={s.brandRow}>
          <Text style={s.brand}>sarvam</Text>
          <View style={s.licBadge}><Text style={s.licBadgeText}>for LIC</Text></View>
        </View>
      </View>

      <View style={s.body}>
        {currentPhoto && (
          <Image source={{ uri: currentPhoto }} style={s.preview} resizeMode="cover" />
        )}

        <View style={s.progressCard}>
          <View style={s.progressHeader}>
            <ActivityIndicator size="small" color={T.orange} />
            <Text style={s.progressTitle}>{done ? 'Extraction complete' : 'Processing document'}</Text>
          </View>
          <Text style={s.progressStatus}>{statusMsg}</Text>

          {/* Thin progress bar */}
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>

          {/* Step dots */}
          {total > 1 && (
            <View style={s.dots}>
              {draftPhotoUris.map((_, i) => (
                <View
                  key={i}
                  style={[s.dot, i < current ? s.dotDone : i === current - 1 ? s.dotActive : s.dotPending]}
                />
              ))}
            </View>
          )}

          <View style={s.stepRow}>
            <Text style={s.stepLabel}>{current}</Text>
            <Text style={s.stepSep}>of</Text>
            <Text style={s.stepTotal}>{total}</Text>
            <Text style={s.stepUnit}>pages</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  topBar: {
    paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md,
    borderBottomWidth: 1, borderBottomColor: T.borderSoft,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  brand: { fontSize: 22, fontWeight: '800', color: T.text, letterSpacing: -0.6 },
  licBadge: {
    backgroundColor: T.orangeSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  licBadgeText: { ...FONT.tiny, color: T.orangeText, fontWeight: '700' },

  body: { flex: 1, padding: SPACE.lg, alignItems: 'center', justifyContent: 'center', gap: SPACE.lg },

  preview: {
    width: '100%', maxWidth: 360, aspectRatio: 3 / 4,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: T.border,
  },

  progressCard: {
    width: '100%', maxWidth: 360,
    backgroundColor: T.bgMuted,
    borderRadius: RADIUS.lg,
    padding: SPACE.lg, gap: SPACE.sm,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  progressTitle: { ...FONT.h3, color: T.text },
  progressStatus: { ...FONT.small, color: T.textMuted },
  progressTrack: {
    width: '100%', height: 4, borderRadius: 2,
    backgroundColor: T.border, marginTop: SPACE.xs, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: T.orange, borderRadius: 2 },
  dots: { flexDirection: 'row', gap: 6, marginTop: SPACE.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotDone: { backgroundColor: T.orange },
  dotActive: { backgroundColor: T.orange, opacity: 0.55 },
  dotPending: { backgroundColor: T.border },
  stepRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  stepLabel: { ...FONT.h2, color: T.text },
  stepSep: { ...FONT.small, color: T.textMuted },
  stepTotal: { ...FONT.h3, color: T.textSoft },
  stepUnit: { ...FONT.small, color: T.textMuted },
});
