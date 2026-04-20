/**
 * Home — clean Akshar-style dashboard.
 * Slim brand bar, a single hero CTA (Start a field visit), recent visits list.
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

const STATUS_STYLE: Record<Job['status'], { bg: string; fg: string; label: string }> = {
  Pending: { bg: T.amberSoft, fg: T.amber, label: 'Pending' },
  'In Progress': { bg: T.blueSoft, fg: T.blue, label: 'In Progress' },
  Done: { bg: T.greenSoft, fg: T.green, label: 'Completed' },
};

const todayLabel = () =>
  new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

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

      {/* Slim top bar */}
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

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Text style={s.today}>{todayLabel()}</Text>
        <Text style={s.greeting}>Good morning, Agent.</Text>
        <Text style={s.subGreet}>Ready to capture a new field visit?</Text>

        {/* Primary CTA — sunset gradient, matches landing */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleStart} style={s.ctaWrap}>
          <LinearGradient
            colors={['#E8612A', '#F08A3E', '#F4A85A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.cta}
          >
            <View style={s.ctaIcon}>
              <Icon name="camera" size={22} color="#fff" strokeWidth={1.75} />
            </View>
            <View style={s.ctaInfo}>
              <Text style={s.ctaTitle}>Start a field visit</Text>
              <Text style={s.ctaSub}>Scan LIC forms · extract details · track claims</Text>
            </View>
            <View style={s.ctaArrow}>
              <Icon name="arrow-right" size={16} color="#fff" strokeWidth={2.2} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick stats row */}
        <View style={s.statRow}>
          <StatTile
            label="Total"
            value={jobs.length}
            tint={T.blue}
            tintBg={T.blueSoft}
          />
          <StatTile
            label="In progress"
            value={jobs.filter((j) => j.status === 'In Progress').length}
            tint={T.amber}
            tintBg={T.amberSoft}
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
          <Text style={s.sectionTitle}>Recent visits</Text>
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
              Your captured LIC forms will appear here. Tap "Start a field visit" above.
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
  brand: { fontSize: 22, fontWeight: '800', color: T.text, letterSpacing: -0.6 },
  licBadge: {
    backgroundColor: T.orangeSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  licBadgeText: { ...FONT.tiny, color: T.orangeText, fontWeight: '700' },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.bgMuted,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.borderSoft,
  },
  avatarText: { ...FONT.bodyStrong, color: T.text },

  scroll: { paddingHorizontal: SPACE.lg, paddingTop: SPACE.xl },

  today: { ...FONT.small, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '600' },
  greeting: {
    fontSize: 26, fontWeight: '700', color: T.text,
    letterSpacing: -0.6, marginTop: 4,
  },
  subGreet: { ...FONT.body, color: T.textMuted, marginTop: 4, marginBottom: SPACE.xl },

  ctaWrap: {
    borderRadius: RADIUS.xl,
    shadowColor: '#E8612A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25, shadowRadius: 20,
    elevation: 6,
    marginBottom: SPACE.xl,
  },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
    borderRadius: RADIUS.xl,
    padding: SPACE.lg,
  },
  ctaIcon: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
  },
  ctaInfo: { flex: 1 },
  ctaTitle: { ...FONT.h3, color: '#fff', fontSize: 17 },
  ctaSub: { ...FONT.small, color: 'rgba(255,255,255,0.88)', marginTop: 3, lineHeight: 18 },
  ctaArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },

  statRow: { flexDirection: 'row', gap: SPACE.sm, marginBottom: SPACE.xl },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    marginBottom: SPACE.md,
  },
  sectionTitle: { ...FONT.h3, color: T.text, fontSize: 17 },
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
