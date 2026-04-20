/**
 * Home — Sarvam mandala logo over blue→orange gradient hero,
 * white rounded card below with "Field Visit Assistant" and feature chips.
 * Tapping the primary CTA opens the upload dialog.
 */
import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, Image, Alert, ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useJobsStore, type Job } from '../../store/jobs.store';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT } from '../../components/ui/tokens';
import { SARVAM_MONOGRAM_WHITE, SARVAM_WORDMARK_WHITE } from '../../assets/sarvam-logo';

const { height: SCREEN_H } = Dimensions.get('window');

// Gradient: deep navy → mid blue → periwinkle → peach → sarvam orange (top→bottom)
const HERO_COLORS = ['#0A1530', '#142660', '#2E53A8', '#6C87C8', '#C9B89C', '#E89456', '#E8612A'] as const;
const HERO_LOCS   = [0,         0.20,      0.38,      0.55,      0.72,      0.86,      1] as const;

const STATUS_STYLE: Record<Job['status'], { bg: string; fg: string; label: string }> = {
  Pending: { bg: T.amberSoft, fg: T.amber, label: 'Pending' },
  'In Progress': { bg: T.blueSoft, fg: T.blue, label: 'In Progress' },
  Done: { bg: T.greenSoft, fg: T.green, label: 'Completed' },
};

export default function HomeScreen() {
  const router = useRouter();
  const jobs = useJobsStore((s) => s.jobs);
  const deleteJob = useJobsStore((s) => s.deleteJob);

  const handleFieldVisit = useCallback(() => router.push('/job/upload'), [router]);

  const handleJobDelete = useCallback((id: string, name: string) => {
    Alert.alert('Delete Visit', `Remove "${name || 'this visit'}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteJob(id) },
    ]);
  }, [deleteJob]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ─── Gradient hero with mandala logo ─────────────────────────── */}
      <LinearGradient
        colors={HERO_COLORS}
        locations={HERO_LOCS}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={s.hero}
      >
        <SafeAreaView style={s.heroSafe}>
          <Image source={SARVAM_MONOGRAM_WHITE} style={s.mandala} resizeMode="contain" />
          <Image source={SARVAM_WORDMARK_WHITE} style={s.wordmark} resizeMode="contain" />
          <View style={s.licBadge}>
            <Text style={s.licBadgeText}>for LIC</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ─── White rounded card ──────────────────────────────────────── */}
      <View style={s.card}>
        <View style={s.cardHandle} />

        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.title}>Field Visit{'\n'}Assistant</Text>
          <Text style={s.sub}>
            Capture, scan and track LIC policy visits with AI-powered OCR. Fast. Accurate. Private.
          </Text>

          <View style={s.chipRow}>
            <FeatureChip icon="file" label="OCR Scanning" tint={T.blue} tintBg={T.blueSoft} />
            <FeatureChip icon="sparkle" label="AI Extraction" tint={T.text} tintBg={T.bgMuted} />
            <FeatureChip icon="check" label="Visit Tracking" tint={T.green} tintBg={T.greenSoft} />
          </View>

          {/* Primary CTA */}
          <TouchableOpacity style={s.cta} onPress={handleFieldVisit} activeOpacity={0.88}>
            <Text style={s.ctaText}>Start a Field Visit</Text>
            <View style={s.ctaArrow}>
              <Icon name="arrow-right" size={16} color="#fff" strokeWidth={2.2} />
            </View>
          </TouchableOpacity>

          {/* Recent visits */}
          {jobs.length > 0 && (
            <>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Recent visits</Text>
                <Text style={s.sectionCount}>
                  {jobs.length} {jobs.length === 1 ? 'visit' : 'visits'}
                </Text>
              </View>
              <FlatList
                data={jobs}
                keyExtractor={(j) => j.id}
                renderItem={({ item }) => (
                  <DocumentCard
                    job={item}
                    onDelete={() => handleJobDelete(item.id, item.holderName || item.docTitle)}
                  />
                )}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              />
            </>
          )}

          <View style={{ height: SPACE.xxl }} />
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Feature chip ────────────────────────────────────────────────────────────
function FeatureChip({
  icon, label, tint, tintBg,
}: {
  icon: 'file' | 'sparkle' | 'check';
  label: string;
  tint: string;
  tintBg: string;
}) {
  return (
    <View style={ch.wrap}>
      <View style={[ch.iconBox, { backgroundColor: tintBg }]}>
        <Icon name={icon} size={12} color={tint} strokeWidth={2} />
      </View>
      <Text style={ch.label}>{label}</Text>
    </View>
  );
}
const ch = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: T.bgMuted,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10, paddingVertical: 8,
    borderWidth: 1, borderColor: T.borderSoft,
  },
  iconBox: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { ...FONT.small, fontWeight: '600', color: T.text, paddingRight: 4 },
});

// ─── Document card ───────────────────────────────────────────────────────────
function DocumentCard({ job, onDelete }: { job: Job; onDelete: () => void }) {
  const st = STATUS_STYLE[job.status];
  const date = new Date(job.createdAt);
  const dateLabel = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const title = job.holderName?.trim() || job.docTitle?.trim() || 'Untitled Visit';

  return (
    <TouchableOpacity style={c.card} onLongPress={onDelete} activeOpacity={0.88}>
      {job.photoUris.length > 0 ? (
        <Image source={{ uri: job.photoUris[0] }} style={c.thumb} />
      ) : (
        <View style={[c.thumb, c.thumbPlaceholder]}>
          <Icon name="file" size={22} color={T.textMuted} />
        </View>
      )}
      <View style={c.info}>
        <View style={c.topRow}>
          <Text style={c.title} numberOfLines={1}>{title}</Text>
          <View style={[c.statusPill, { backgroundColor: st.bg }]}>
            <Text style={[c.statusText, { color: st.fg }]}>{st.label}</Text>
          </View>
        </View>
        <Text style={c.formType}>LIC Proposal Form</Text>
        {job.policyNumber ? (
          <Text style={c.policy} numberOfLines={1}>Policy #{job.policyNumber}</Text>
        ) : null}
        <View style={c.footerRow}>
          <Icon name="clock" size={11} color={T.textFaint} strokeWidth={1.5} />
          <Text style={c.date}>{dateLabel}</Text>
          {job.photoUris.length > 1 && (
            <>
              <View style={c.footerDot} />
              <Text style={c.date}>{job.photoUris.length} pages</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const c = StyleSheet.create({
  card: {
    flexDirection: 'row', gap: SPACE.md,
    backgroundColor: T.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: T.border,
    padding: SPACE.md,
  },
  thumb: { width: 64, height: 78, borderRadius: RADIUS.md, backgroundColor: T.bgMuted },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 3 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  title: { flex: 1, ...FONT.h3, color: T.text },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.sm },
  statusText: { ...FONT.tiny },
  formType: { ...FONT.small, color: T.textMuted },
  policy: { ...FONT.small, color: T.textSoft, fontWeight: '500' },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  footerDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: T.textFaint, marginHorizontal: 2 },
  date: { ...FONT.tiny, color: T.textFaint },
});

// ─── Main styles ─────────────────────────────────────────────────────────────
const HERO_H = Math.round(SCREEN_H * 0.48);

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8612A' },

  hero: { height: HERO_H },
  heroSafe: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingBottom: SPACE.xl, gap: SPACE.md,
  },
  mandala: { width: 140, height: 140 },
  wordmark: { width: 200, height: 48 },
  licBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)',
    marginTop: 4,
  },
  licBadgeText: { ...FONT.small, color: '#fff', fontWeight: '700', letterSpacing: 0.2 },

  card: {
    flex: 1,
    backgroundColor: T.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 12,
  },
  cardHandle: {
    width: 44, height: 4, borderRadius: 2,
    backgroundColor: '#DCE3F0',
    alignSelf: 'center', marginTop: 10, marginBottom: SPACE.sm,
  },
  scrollContent: { paddingHorizontal: SPACE.xl, paddingTop: SPACE.md, paddingBottom: SPACE.lg },

  title: {
    fontSize: 32, fontWeight: '800', color: T.text,
    letterSpacing: -1, lineHeight: 38, marginBottom: SPACE.md,
  },
  sub: {
    ...FONT.body, color: T.textMuted, lineHeight: 22,
    marginBottom: SPACE.lg,
  },

  chipRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    marginBottom: SPACE.xl,
  },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: T.dark,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 22, paddingVertical: 16,
    marginBottom: SPACE.xl,
  },
  ctaText: { color: '#fff', ...FONT.bodyStrong, fontSize: 16 },
  ctaArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    marginBottom: SPACE.md,
  },
  sectionTitle: { ...FONT.h3, color: T.text, fontSize: 17 },
  sectionCount: { ...FONT.small, color: T.textMuted },
});
