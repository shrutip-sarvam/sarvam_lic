/**
 * Home / Dashboard — Akshar Vision blue hero.
 * Field Visit Assistant card is the primary entry — opens the upload dialog.
 */
import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, Image, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useJobsStore, type Job } from '../../store/jobs.store';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT } from '../../components/ui/tokens';

const AKSHAR_BLUE_DARK = '#0F1E3D';
const AKSHAR_BLUE = '#1E3A8A';
const AKSHAR_BLUE_SOFT = '#3B5BC8';

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
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[AKSHAR_BLUE_DARK, AKSHAR_BLUE, AKSHAR_BLUE_SOFT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <SafeAreaView>
          <View style={s.topBar}>
            <View style={s.brandRow}>
              <Text style={s.brand}>sarvam</Text>
              <View style={s.licBadge}>
                <Text style={s.licBadgeText}>for LIC</Text>
              </View>
            </View>
            <TouchableOpacity style={s.avatar}>
              <Text style={s.avatarText}>A</Text>
            </TouchableOpacity>
          </View>

          <View style={s.heroContent}>
            <Text style={s.greeting}>Welcome</Text>
            <Text style={s.heroTitle}>Field Operations{'\n'}Dashboard</Text>
            <Text style={s.heroSub}>
              Digitize LIC documents with AI-powered OCR & translation
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={s.scrollArea}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Field Visit Assistant — opens upload dialog */}
        <TouchableOpacity
          style={s.featureCard}
          onPress={handleFieldVisit}
          activeOpacity={0.88}
        >
          <View style={s.featureIconWrap}>
            <Icon name="camera" size={28} color="#fff" strokeWidth={1.75} />
          </View>
          <View style={s.featureInfo}>
            <View style={s.featureTitleRow}>
              <Text style={s.featureTitle}>Field Visit Assistant</Text>
              <View style={s.featureArrow}>
                <Icon name="arrow-right" size={14} color="#fff" strokeWidth={2} />
              </View>
            </View>
            <Text style={s.featureSub}>
              Capture LIC forms, extract details, submit claims
            </Text>
            <View style={s.featureMeta}>
              <View style={s.metaChip}>
                <Icon name="sparkle" size={10} color="#fff" strokeWidth={2} />
                <Text style={s.metaChipText}>AI OCR</Text>
              </View>
              <View style={s.metaChip}>
                <Text style={s.metaChipText}>10+ languages</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent visits</Text>
          {jobs.length > 0 && (
            <Text style={s.sectionCount}>
              {jobs.length} {jobs.length === 1 ? 'visit' : 'visits'}
            </Text>
          )}
        </View>

        {jobs.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyTitle}>No visits yet</Text>
            <Text style={s.emptySub}>
              Tap "Field Visit Assistant" above to capture your first document.
            </Text>
          </View>
        ) : (
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
        )}

        <View style={{ height: SPACE.xxl }} />
      </ScrollView>
    </View>
  );
}

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

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  hero: { paddingBottom: SPACE.xxl },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  brand: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.6 },
  licBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  licBadgeText: { ...FONT.tiny, color: '#fff', fontWeight: '700' },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarText: { ...FONT.bodyStrong, color: '#fff' },

  heroContent: { paddingHorizontal: SPACE.lg, paddingTop: SPACE.md, paddingBottom: SPACE.lg },
  greeting: { ...FONT.small, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginBottom: 4 },
  heroTitle: {
    fontSize: 30, fontWeight: '700', color: '#fff',
    letterSpacing: -0.8, lineHeight: 36, marginBottom: 10,
  },
  heroSub: {
    ...FONT.body, color: 'rgba(255,255,255,0.75)', lineHeight: 20, maxWidth: 320,
  },

  scrollArea: { flex: 1, marginTop: -SPACE.xl },
  scrollContent: { paddingHorizontal: SPACE.lg, paddingBottom: SPACE.lg },

  featureCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
    backgroundColor: AKSHAR_BLUE_DARK,
    borderRadius: RADIUS.xl,
    padding: SPACE.lg,
    marginBottom: SPACE.xl,
    shadowColor: AKSHAR_BLUE_DARK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16,
    elevation: 6,
  },
  featureIconWrap: {
    width: 56, height: 56, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  featureInfo: { flex: 1 },
  featureTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  featureTitle: { flex: 1, ...FONT.h3, color: '#fff', fontSize: 17 },
  featureArrow: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  featureSub: { ...FONT.small, color: 'rgba(255,255,255,0.75)', marginTop: 3, lineHeight: 18 },
  featureMeta: { flexDirection: 'row', gap: 6, marginTop: SPACE.sm },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  metaChipText: { ...FONT.tiny, color: '#fff', fontWeight: '600' },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    marginBottom: SPACE.md,
  },
  sectionTitle: { ...FONT.h3, color: T.text, fontSize: 17 },
  sectionCount: { ...FONT.small, color: T.textMuted },

  emptyCard: {
    paddingVertical: SPACE.xl, paddingHorizontal: SPACE.lg,
    alignItems: 'center', backgroundColor: T.bgMuted, borderRadius: RADIUS.lg,
  },
  emptyTitle: { ...FONT.h3, color: T.text, marginBottom: 4 },
  emptySub: { ...FONT.small, color: T.textMuted, textAlign: 'center' },
});
