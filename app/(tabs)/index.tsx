/**
 * Home — Akshar web dashboard, ported 1:1 for mobile.
 * Mirrors akshar-frontend/src/app/dashboard/page.tsx:
 *  - Slim Header with "Home" title and avatar, divider below.
 *  - Empty state: upload tile centered + "Welcome, {name}" + CTA buttons.
 *  - Populated: "Welcome back, {name}!" + compact Upload Card + Recent list.
 * Design tokens sourced from akshar-frontend globals.css (Tatva).
 */
import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, Image, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useJobsStore, type Job } from '../../store/jobs.store';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT } from '../../components/ui/tokens';

const STATUS_STYLE: Record<Job['status'], { bg: string; fg: string; label: string }> = {
  Pending: { bg: T.amberSoft, fg: T.amber, label: 'Pending' },
  'In Progress': { bg: T.blueSoft, fg: T.blue, label: 'In Progress' },
  Done: { bg: T.greenSoft, fg: T.green, label: 'Completed' },
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

      {/* Header — Tatva <Header type="main"> pattern: title left, action/avatar right, divider below */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Home</Text>
        <TouchableOpacity style={s.avatar} activeOpacity={0.8}>
          <Text style={s.avatarText}>{AGENT_NAME[0]}</Text>
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
          <Text style={s.welcome}>Welcome back, {AGENT_NAME}!</Text>

          <UploadCard onPress={handleStart} />

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

          <View style={{ height: SPACE.xxl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ─── Empty state (mirrors Akshar's upload-page.svg + welcome) ──────────────── */
function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <View style={e.root}>
      <View style={e.tile}>
        <View style={e.tileInner}>
          <Icon name="upload" size={34} color="#fff" strokeWidth={2.2} />
        </View>
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

/* ─── Upload card (mirrors Tatva <Card heading description image clickable />) ─ */
function UploadCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={u.card} onPress={onPress} activeOpacity={0.88}>
      <View style={u.thumb}>
        <Icon name="upload" size={22} color="#fff" strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={u.heading}>Upload document</Text>
        <Text style={u.desc}>Max size 200MB • PDF, JPEG, PNG, ZIP</Text>
      </View>
      <Icon name="chevron-right" size={18} color={T.textMuted} />
    </TouchableOpacity>
  );
}

/* ─── Recent visit card ─────────────────────────────────────────────────────── */
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
        <Text style={c.formType}>LIC Claim Form</Text>
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

/* ─── Styles ────────────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACE.lg, paddingTop: SPACE.md, paddingBottom: SPACE.md,
    backgroundColor: T.bg,
  },
  headerTitle: {
    fontSize: 22, fontWeight: '600', color: T.text,
    letterSpacing: -0.4,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.bgMuted,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.borderSoft,
  },
  avatarText: { ...FONT.bodyStrong, color: T.text },
  divider: { height: 1, backgroundColor: T.borderSoft },

  scroll: { paddingHorizontal: SPACE.lg, paddingTop: SPACE.lg },

  welcome: {
    fontSize: 20, fontWeight: '600', color: T.text,
    letterSpacing: -0.3, marginBottom: SPACE.md,
  },

  recent: {
    fontSize: 15, fontWeight: '600', color: T.text,
    letterSpacing: -0.2, marginTop: SPACE.lg, marginBottom: SPACE.md,
  },
});

const u = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
    backgroundColor: T.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: T.border,
    padding: SPACE.md,
  },
  thumb: {
    width: 56, height: 56, borderRadius: RADIUS.md,
    backgroundColor: T.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  heading: { fontSize: 15, fontWeight: '600', color: T.text, letterSpacing: -0.2 },
  desc: { ...FONT.small, color: T.textMuted, marginTop: 3 },
});

const e = StyleSheet.create({
  root: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACE.lg, paddingBottom: 64,
  },
  tile: {
    width: 96, height: 96, borderRadius: RADIUS.xl,
    backgroundColor: T.orange,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACE.lg,
  },
  tileInner: {
    width: 62, height: 62, borderRadius: 31,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: 22, fontWeight: '600', color: T.text,
    letterSpacing: -0.4, textAlign: 'center',
  },
  sub: {
    ...FONT.body, color: T.textSoft,
    marginTop: SPACE.sm, marginBottom: SPACE.xl,
    textAlign: 'center', lineHeight: 20,
  },
  ctaCol: { gap: SPACE.sm, width: '100%', alignItems: 'center' },
  primary: {
    backgroundColor: T.orange,
    paddingHorizontal: 28, paddingVertical: 13,
    borderRadius: RADIUS.pill,
    alignItems: 'center', justifyContent: 'center',
    minWidth: 200,
  },
  primaryText: { color: '#fff', ...FONT.bodyStrong, fontSize: 15 },
  secondary: {
    backgroundColor: T.bg,
    borderWidth: 1, borderColor: T.border,
    paddingHorizontal: 28, paddingVertical: 13,
    borderRadius: RADIUS.pill,
    alignItems: 'center', justifyContent: 'center',
    minWidth: 200,
  },
  secondaryText: { color: T.text, ...FONT.bodyStrong, fontSize: 15 },
});

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
