/**
 * Home — 1:1 port of akshar-frontend/src/app/dashboard/page.tsx for mobile.
 * Tatva patterns preserved:
 *   - <Header type="main"> with left title + primary actions right + divider
 *   - Vertical <Card> for Upload (image on top, heading, description, clickable)
 *   - heading-lg / heading-md / heading-sm / body-md text variants
 *   - Decorative Indic-script strip at the bottom edge
 *   - Empty state mirrors the Akshar /upload-page.svg flow
 */
import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, Image, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { useJobsStore, type Job } from '../../store/jobs.store';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT } from '../../components/ui/tokens';
import { AKSHAR_LOGO_SVG } from '../../assets/akshar-logo';

const STATUS_STYLE: Record<Job['status'], { bg: string; fg: string; label: string }> = {
  Pending: { bg: T.amberSoft, fg: T.amber, label: 'Processing' },
  'In Progress': { bg: T.blueSoft, fg: T.blue, label: 'Processing' },
  Done: { bg: T.greenSoft, fg: T.green, label: 'HTML Ready' },
};

const AGENT_NAME = 'Agent';

export default function HomeScreen() {
  const router = useRouter();
  const jobs = useJobsStore((s) => s.jobs);
  const deleteJob = useJobsStore((s) => s.deleteJob);

  const handleStart = useCallback(() => router.push('/job/upload'), [router]);

  const handleJobDelete = useCallback((id: string, name: string) => {
    Alert.alert('Delete Visit', `Remove "${name || 'this visit'}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteJob(id) },
    ]);
  }, [deleteJob]);

  const isEmpty = jobs.length === 0;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Tatva Header — mandala logo + "Home" left, "Join Waitlist" primary right */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.brandMark}>
            <SvgXml xml={AKSHAR_LOGO_SVG} width={22} height={22} color={T.text} />
          </View>
          <Text style={s.headerTitle}>Home</Text>
        </View>
        <TouchableOpacity style={s.waitlistBtn} activeOpacity={0.88}>
          <Text style={s.waitlistText}>Join Waitlist</Text>
        </TouchableOpacity>
      </View>
      <View style={s.divider} />

      {isEmpty ? (
        <EmptyState onStart={handleStart} />
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* heading-md — Tatva 20/700/-0.4 */}
          <Text style={s.welcome}>Welcome back, {AGENT_NAME}!</Text>

          <UploadCard onPress={handleStart} />

          {/* heading-sm — Tatva 16/600/-0.2 */}
          <Text style={s.recent}>Recent</Text>

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

          <View style={{ height: 96 }} />
        </ScrollView>
      )}

      {/* Decorative Indic-script strip — mirrors dashboard /indic-bg.png */}
      <IndicStrip />
    </SafeAreaView>
  );
}

/* ─── Empty state — mirrors Akshar /upload-page.svg centered flow ──────────── */
function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <View style={e.root}>
      <View style={e.glyph}>
        <SvgXml xml={AKSHAR_LOGO_SVG} width={96} height={96} color={T.orange} />
      </View>
      <Text style={e.title}>Welcome, {AGENT_NAME}</Text>
      <Text style={e.sub}>
        Upload your document and{'\n'}get started with digitising
      </Text>
      <View style={e.ctaCol}>
        <TouchableOpacity style={e.primary} onPress={onStart} activeOpacity={0.88}>
          <Text style={e.primaryText}>Upload Document</Text>
        </TouchableOpacity>
        <TouchableOpacity style={e.secondary} activeOpacity={0.8}>
          <Text style={e.secondaryText}>Learn How It Works</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── Upload card — Tatva <Card direction="vertical" heading description image /> */
function UploadCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={u.card} onPress={onPress} activeOpacity={0.9}>
      <View style={u.thumb}>
        <View style={u.thumbLine} />
        <View style={u.thumbArrowWrap}>
          <Icon name="upload" size={22} color="#fff" strokeWidth={2.2} />
        </View>
      </View>
      <Text style={u.heading}>Upload document</Text>
      <Text style={u.desc}>Max size 200MB • PDF, JPEG, PNG, ZIP</Text>
    </TouchableOpacity>
  );
}

/* ─── Recent visit row (mobile stand-in for the Tatva <Table>) ──────────────── */
function DocumentCard({ job, onDelete }: { job: Job; onDelete: () => void }) {
  const st = STATUS_STYLE[job.status];
  const date = new Date(job.createdAt);
  const dateLabel = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const title = job.holderName?.trim() || job.docTitle?.trim() || 'Untitled Visit';

  return (
    <TouchableOpacity style={c.card} onLongPress={onDelete} activeOpacity={0.9}>
      {job.photoUris.length > 0 ? (
        <Image source={{ uri: job.photoUris[0] }} style={c.thumb} />
      ) : (
        <View style={[c.thumb, c.thumbPlaceholder]}>
          <Icon name="file" size={22} color={T.textMuted} />
        </View>
      )}
      <View style={c.info}>
        <Text style={c.title} numberOfLines={1}>{title}</Text>
        <Text style={c.formType}>LIC Claim Form</Text>
        <View style={c.metaRow}>
          <View style={[c.statusPill, { backgroundColor: st.bg }]}>
            <Text style={[c.statusText, { color: st.fg }]}>{st.label}</Text>
          </View>
          <Text style={c.date}>{dateLabel}</Text>
          {job.photoUris.length > 1 && (
            <>
              <View style={c.dot} />
              <Text style={c.date}>{job.photoUris.length} pages</Text>
            </>
          )}
        </View>
      </View>
      <Icon name="chevron-right" size={18} color={T.textFaint} />
    </TouchableOpacity>
  );
}

/* ─── Indic script decorative strip — mirrors /indic-bg.png at bottom ───────── */
function IndicStrip() {
  const chars = 'अआइईउकखगघचजझटडणतथदधनपफबभमयरलवशषसहअक्षरا ب پ ت ث ج چ ح خ د ذ ر';
  return (
    <View pointerEvents="none" style={ind.wrap}>
      <Text numberOfLines={1} style={ind.text}>{chars}</Text>
    </View>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACE.lg, paddingTop: SPACE.md, paddingBottom: SPACE.md,
    backgroundColor: T.bg,
  },
  headerLeft: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
  },
  brandMark: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: T.bgMuted,
  },
  headerTitle: {
    fontSize: 22, fontWeight: '600', color: T.text, letterSpacing: -0.4,
  },
  waitlistBtn: {
    backgroundColor: T.dark,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS.pill,
  },
  waitlistText: { color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: -0.1 },
  divider: { height: 1, backgroundColor: T.borderSoft },

  scroll: { paddingHorizontal: SPACE.lg, paddingTop: SPACE.lg },

  welcome: {
    fontSize: 20, fontWeight: '700', color: T.text,
    letterSpacing: -0.4, marginBottom: SPACE.lg,
  },
  recent: {
    fontSize: 16, fontWeight: '600', color: T.text,
    letterSpacing: -0.2, marginTop: SPACE.xl, marginBottom: SPACE.md,
  },
});

const u = StyleSheet.create({
  // Tatva <Card direction="vertical"> look
  card: {
    backgroundColor: T.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: T.border,
    padding: SPACE.lg,
    gap: SPACE.md,
    // subtle Tatva resting shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  thumb: {
    width: 60, height: 60, borderRadius: 14,
    backgroundColor: T.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  thumbLine: {
    position: 'absolute', top: 18, width: 22, height: 2, borderRadius: 1,
    backgroundColor: '#fff',
  },
  thumbArrowWrap: { marginTop: 10 },
  heading: {
    fontSize: 18, fontWeight: '600', color: T.text, letterSpacing: -0.3,
  },
  desc: { ...FONT.small, color: T.textMuted },
});

const e = StyleSheet.create({
  root: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACE.lg, paddingBottom: 72,
  },
  glyph: { marginBottom: SPACE.xl },
  title: {
    fontSize: 28, fontWeight: '700', color: T.text,
    letterSpacing: -0.6, textAlign: 'center',
  },
  sub: {
    fontSize: 14, color: T.textSoft,
    marginTop: SPACE.sm, marginBottom: SPACE.xl,
    textAlign: 'center', lineHeight: 20,
  },
  ctaCol: { gap: SPACE.sm, width: '100%', alignItems: 'center' },
  primary: {
    backgroundColor: T.dark,
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: RADIUS.pill,
    alignItems: 'center', justifyContent: 'center',
    minWidth: 220,
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },
  secondary: {
    backgroundColor: T.bg,
    borderWidth: 1, borderColor: T.border,
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: RADIUS.pill,
    alignItems: 'center', justifyContent: 'center',
    minWidth: 220,
  },
  secondaryText: { color: T.text, fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },
});

const c = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
    backgroundColor: T.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: T.border,
    padding: SPACE.md,
  },
  thumb: { width: 56, height: 68, borderRadius: RADIUS.md, backgroundColor: T.bgMuted },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  title: { ...FONT.h3, color: T.text },
  formType: { ...FONT.small, color: T.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.sm },
  statusText: { fontSize: 11, fontWeight: '600' },
  date: { fontSize: 11, color: T.textFaint, fontWeight: '500' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: T.textFaint },
});

const ind = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 0, paddingVertical: 0,
    opacity: 0.06,
  },
  text: {
    fontSize: 72, fontWeight: '400', color: T.text,
    letterSpacing: 4, textAlign: 'center',
    transform: [{ translateY: 18 }],
  },
});
