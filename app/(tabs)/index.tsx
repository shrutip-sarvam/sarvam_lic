/**
 * Home — Akshar-for-LIC dashboard.
 * Mirrors the Akshar (Tatva) welcome card: mandala logo thumbnail, semi-bold
 * heading, supportive description, four feature pills, and an Akshar-orange
 * primary CTA. Below: quick stats + Recent visits, in the spirit of the
 * Akshar dashboard "Recent" section.
 */
import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, Image, Alert, ScrollView,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useJobsStore, type Job } from '../../store/jobs.store';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT } from '../../components/ui/tokens';
import { AKSHAR_LOGO_SVG } from '../../assets/akshar-logo';

const STATUS_STYLE: Record<Job['status'], { bg: string; fg: string; label: string }> = {
  Pending: { bg: T.amberSoft, fg: T.amber, label: 'Pending' },
  'In Progress': { bg: T.blueSoft, fg: T.blue, label: 'In Progress' },
  Done: { bg: T.greenSoft, fg: T.green, label: 'Completed' },
};

const todayLabel = () =>
  new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

type FeatureIcon = 'shield' | 'sparkle' | 'eye' | 'check-circle';
const FEATURES: { label: string; icon: FeatureIcon }[] = [
  { label: 'Secure processing', icon: 'shield' },
  { label: 'High-quality extraction', icon: 'sparkle' },
  { label: 'Easy data review', icon: 'eye' },
  { label: 'Automatic validations', icon: 'check-circle' },
];

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

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Slim top bar — Akshar mandala + wordmark, no LIC pill */}
      <View style={s.topBar}>
        <View style={s.brandRow}>
          <SvgXml xml={AKSHAR_LOGO_SVG} width={22} height={22} color={T.text} />
          <Text style={s.brand}>Akshar</Text>
        </View>
        <TouchableOpacity style={s.avatar}>
          <Text style={s.avatarText}>A</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Text style={s.today}>{todayLabel()}</Text>
        <Text style={s.greeting}>Good morning, Agent.</Text>

        {/* Welcome / Upload card — mirrors Akshar Tatva Card */}
        <View style={s.welcomeCard}>
          <View style={s.welcomeHead}>
            <View style={s.logoTile}>
              <SvgXml xml={AKSHAR_LOGO_SVG} width={36} height={36} color={T.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.welcomeTitle}>Akshar for LIC</Text>
              <Text style={s.welcomeSub}>
                Assist policyholders in the field with on-the-go scanning and upload.
              </Text>
            </View>
          </View>

          {/* Feature pills */}
          <View style={s.featureGrid}>
            {FEATURES.map((f) => (
              <View key={f.label} style={s.featurePill}>
                <Icon name={f.icon} size={14} color={T.orange} strokeWidth={1.75} />
                <Text style={s.featureText}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Primary CTA — Akshar orange */}
          <TouchableOpacity activeOpacity={0.88} onPress={handleStart} style={s.cta}>
            <Icon name="upload" size={18} color="#fff" strokeWidth={2} />
            <Text style={s.ctaText}>Start new upload</Text>
            <View style={s.ctaArrow}>
              <Icon name="arrow-right" size={14} color="#fff" strokeWidth={2.2} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick stats row */}
        <View style={s.statRow}>
          <StatTile
            label="Total"
            value={jobs.length}
            tint={T.text}
            tintBg={T.bgMuted}
          />
          <StatTile
            label="In progress"
            value={jobs.filter((j) => j.status === 'In Progress').length}
            tint={T.blue}
            tintBg={T.blueSoft}
          />
          <StatTile
            label="Completed"
            value={jobs.filter((j) => j.status === 'Done').length}
            tint={T.green}
            tintBg={T.greenSoft}
          />
        </View>

        {/* Recent visits */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent</Text>
          {jobs.length > 0 && (
            <Text style={s.sectionCount}>
              {jobs.length} {jobs.length === 1 ? 'visit' : 'visits'}
            </Text>
          )}
        </View>

        {jobs.length === 0 ? (
          <View style={s.emptyCard}>
            <View style={s.emptyIconWrap}>
              <Icon name="file" size={26} color={T.textMuted} strokeWidth={1.5} />
            </View>
            <Text style={s.emptyTitle}>No visits yet</Text>
            <Text style={s.emptySub}>
              Your captured LIC forms will appear here once you finish an upload.
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
    </SafeAreaView>
  );
}

function StatTile({
  label, value, tint, tintBg,
}: { label: string; value: number; tint: string; tintBg: string }) {
  return (
    <View style={[stats.tile, { backgroundColor: tintBg }]}>
      <Text style={[stats.value, { color: tint }]}>{value}</Text>
      <Text style={stats.label}>{label}</Text>
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md,
    borderBottomWidth: 1, borderBottomColor: T.borderSoft,
    backgroundColor: T.bg,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  brand: { fontSize: 18, fontWeight: '600', color: T.text, letterSpacing: -0.3 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.bgMuted,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.borderSoft,
  },
  avatarText: { ...FONT.bodyStrong, color: T.text },

  scroll: { paddingHorizontal: SPACE.lg, paddingTop: SPACE.xl },

  today: {
    ...FONT.small, color: T.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '600',
  },
  greeting: {
    fontSize: 24, fontWeight: '600', color: T.text,
    letterSpacing: -0.5, marginTop: 4, marginBottom: SPACE.xl,
  },

  welcomeCard: {
    backgroundColor: T.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: T.border,
    padding: SPACE.lg,
    gap: SPACE.md,
    marginBottom: SPACE.xl,
  },
  welcomeHead: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
  },
  logoTile: {
    width: 52, height: 52, borderRadius: RADIUS.md,
    backgroundColor: T.orangeSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 18, fontWeight: '600', color: T.text,
    letterSpacing: -0.3,
  },
  welcomeSub: {
    fontSize: 13, fontWeight: '400',
    color: T.textSoft, marginTop: 3, lineHeight: 18,
  },

  featureGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    marginTop: 2,
  },
  featurePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: T.orangeSoft,
  },
  featureText: {
    fontSize: 12, fontWeight: '500',
    color: T.orangeText,
  },

  cta: {
    flexDirection: 'row', alignItems: 'center',
    gap: SPACE.sm,
    backgroundColor: T.orange,
    borderRadius: RADIUS.md,
    paddingVertical: 14, paddingHorizontal: SPACE.md,
    marginTop: SPACE.xs,
  },
  ctaText: {
    flex: 1,
    fontSize: 15, fontWeight: '600',
    color: '#fff', letterSpacing: -0.2,
    marginLeft: 2,
  },
  ctaArrow: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },

  statRow: { flexDirection: 'row', gap: SPACE.sm, marginBottom: SPACE.xl },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    marginBottom: SPACE.md,
  },
  sectionTitle: { ...FONT.h3, color: T.text, fontSize: 17, fontWeight: '600' },
  sectionCount: { ...FONT.small, color: T.textMuted },

  emptyCard: {
    paddingVertical: SPACE.xxl, paddingHorizontal: SPACE.lg,
    alignItems: 'center',
    backgroundColor: T.bgMuted,
    borderRadius: RADIUS.lg,
    gap: SPACE.sm,
  },
  emptyIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: T.bg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.borderSoft,
  },
  emptyTitle: { ...FONT.h3, color: T.text, marginTop: SPACE.sm },
  emptySub: { ...FONT.small, color: T.textMuted, textAlign: 'center', maxWidth: 280, lineHeight: 18 },
});

const stats = StyleSheet.create({
  tile: {
    flex: 1,
    paddingVertical: SPACE.md, paddingHorizontal: SPACE.md,
    borderRadius: RADIUS.md,
    gap: 2,
  },
  value: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  label: { ...FONT.tiny, color: T.textSoft, fontWeight: '600' },
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
