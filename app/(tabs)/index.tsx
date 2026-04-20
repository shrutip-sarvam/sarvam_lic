import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SARVAM_MONOGRAM_WHITE, SARVAM_MONOGRAM_BLACK, SARVAM_WORDMARK_WHITE, SARVAM_WORDMARK_BLACK } from '../../assets/sarvam-logo';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useJobsStore, type Job, type JobStatus, type VisitType } from '../../store/jobs.store';

const { height: SH } = Dimensions.get('window');

const T = {
  bg: '#FFFFFF', bgSoft: '#F7F5F2', text: '#1A1A1A',
  muted: '#9A9A9A', border: '#EBEBEB',
  peach: '#FBE8D9', peachText: '#7A3A18',
  orange: '#E8612A', navy: '#1A3B6E', gold: '#F5C518',
};

const STATUS: Record<JobStatus, { bg: string; fg: string }> = {
  Pending:       { bg: '#FEF3C7', fg: '#92400E' },
  'In Progress': { bg: '#DBEAFE', fg: '#1E40AF' },
  Done:          { bg: '#D1FAE5', fg: '#065F46' },
};

const VISIT_COLOR: Record<VisitType, string> = {
  'New Proposal': T.navy, 'Premium Collection': '#10B981',
  'Claim Survey': '#F59E0B', 'Policy Revival': '#6366F1',
  'Maturity Collection': '#059669', 'Death Claim': '#DC2626', 'Other': '#6B7280',
};

const STATUSES: JobStatus[] = ['Pending', 'In Progress', 'Done'];

// ─── Mandala ──────────────────────────────────────────────────────────────────
function Mandala({ size = 36, color = '#fff' }: { size?: number; color?: string }) {
  const r = Math.floor(size / 2);
  const petalR = Math.floor(r * 0.22);
  const dist = r * 0.55;
  return (
    <View style={{ width: size, height: size }}>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        return (
          <View key={i} style={{
            position: 'absolute',
            left: Math.round(r + Math.cos(a) * dist - petalR),
            top: Math.round(r + Math.sin(a) * dist - petalR),
            width: petalR * 2, height: petalR * 2,
            borderRadius: petalR, borderWidth: 1.5, borderColor: color,
          }} />
        );
      })}
      <View style={{
        position: 'absolute',
        left: r - Math.floor(r * 0.3), top: r - Math.floor(r * 0.3),
        width: Math.floor(r * 0.6), height: Math.floor(r * 0.6),
        borderRadius: Math.floor(r * 0.3), borderWidth: 1.5, borderColor: color,
      }} />
      <View style={{
        position: 'absolute', left: 0, top: 0, width: size, height: size,
        borderRadius: r, borderWidth: 1, borderColor: color, opacity: 0.3,
      }} />
    </View>
  );
}

// ─── Splash (empty state) ─────────────────────────────────────────────────────
function Splash({ onNew }: { onNew: () => void }) {
  return (
    <View style={sp.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Smooth gradient hero — matches Sarvam brand */}
      <LinearGradient
        colors={['#040810', '#0a1530', '#142660', '#1e4090', '#4878c8', '#a8c4e8', '#ddb890', '#e87828']}
        locations={[0, 0.12, 0.25, 0.40, 0.56, 0.70, 0.84, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={sp.hero}
      >
        <SafeAreaView style={sp.heroInner}>
          {/* Mandala icon — white gradient */}
          <Image source={SARVAM_MONOGRAM_WHITE} style={sp.logoImg} resizeMode="contain" />
          <Image source={SARVAM_WORDMARK_WHITE} style={sp.logoWordmark} resizeMode="contain" />
          <View style={sp.forLicPill}>
            <Text style={sp.forLicPillText}>for LIC</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* White card slides up over gradient */}
      <View style={sp.card}>
        <View style={sp.cardHandle} />
        <ScrollView
          contentContainerStyle={sp.panel}
          showsVerticalScrollIndicator={false}
          bounces
        >
          <Text style={sp.headline}>Field Visit{'\n'}Assistant</Text>
          <Text style={sp.sub}>
            Capture, scan and track LIC policy visits with AI-powered OCR. Fast. Accurate. Private.
          </Text>

          <View style={sp.chipRow}>
            {[
              { icon: '📄', label: 'OCR Scanning' },
              { icon: '✦', label: 'AI Extraction' },
              { icon: '📊', label: 'Visit Tracking' },
            ].map(({ icon, label }) => (
              <View key={label} style={sp.chip}>
                <Text style={sp.chipIcon}>{icon}</Text>
                <Text style={sp.chipText}>{label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={sp.btnPrimary} onPress={onNew} activeOpacity={0.88}>
            <Text style={sp.btnPrimaryText}>Start New Visit</Text>
            <View style={sp.btnArrowCircle}>
              <Text style={sp.btnArrow}>→</Text>
            </View>
          </TouchableOpacity>

          <View style={sp.footerBrand}>
            <Image source={SARVAM_MONOGRAM_BLACK} style={{ width: 16, height: 16, opacity: 0.3 }} resizeMode="contain" />
            <Text style={sp.footerText}>LIC Field Agent</Text>
            <Text style={sp.footerDot}>·</Text>
            <Text style={sp.footerText}>Powered by</Text>
            <Image source={SARVAM_WORDMARK_BLACK} style={{ width: 52, height: 14, opacity: 0.3 }} resizeMode="contain" />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const sp = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#e87828' },

  hero: { height: SH * 0.50 },
  heroInner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 16 },
  logoImg: { width: 148, height: 148 },
  logoWordmark: { width: 220, height: 52, marginTop: 12 },
  forLicPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14, paddingVertical: 5, marginTop: 10,
  },
  forLicPillText: { fontSize: 12, color: 'rgba(255,255,255,0.95)', fontWeight: '600', letterSpacing: 0.4 },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  cardHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0',
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  panel: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: 60 },

  headline: { fontSize: 34, fontWeight: '800', color: '#1A1A1A', lineHeight: 42, marginBottom: 10, letterSpacing: -1 },
  sub: { fontSize: 15, color: '#888', lineHeight: 24, marginBottom: 24 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F5F3F0', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  chipIcon: { fontSize: 14 },
  chipText: { fontSize: 13, color: '#444', fontWeight: '600' },

  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#111111', borderRadius: 18,
    paddingHorizontal: 22, paddingVertical: 18, marginBottom: 20,
  },
  btnPrimaryText: { fontSize: 17, color: '#fff', fontWeight: '700', letterSpacing: -0.3 },
  btnArrowCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  btnArrow: { fontSize: 18, color: '#fff' },

  footerBrand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  footerText: { fontSize: 12, color: '#C0C0C0', letterSpacing: 0.3 },
  footerDot: { fontSize: 12, color: '#C0C0C0' },
  footerWordmark: { fontSize: 12, color: '#C0C0C0', fontWeight: '700', letterSpacing: -0.5 },
});

// ─── Job bubble ───────────────────────────────────────────────────────────────
function JobBubble({ job, onPress, onDelete }: { job: Job; onPress: () => void; onDelete: () => void }) {
  const visitColor = VISIT_COLOR[job.visitType] ?? T.navy;
  const st = STATUS[job.status];
  const date = new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return (
    <View style={bbl.row}>
      <TouchableOpacity onPress={onPress} onLongPress={onDelete} activeOpacity={0.88} style={bbl.bubble}>
        <View style={bbl.topRow}>
          <Text style={[bbl.visitTag, { color: visitColor }]}>{job.visitType}</Text>
          <View style={[bbl.pill, { backgroundColor: st.bg }]}>
            <Text style={[bbl.pillText, { color: st.fg }]}>{job.status}</Text>
          </View>
        </View>
        <Text style={bbl.name} numberOfLines={1}>{job.holderName || 'Unnamed Policyholder'}</Text>
        {(job.policyNumber || job.sumAssured) ? (
          <View style={bbl.metaRow}>
            {job.policyNumber ? <Text style={bbl.meta}>#{job.policyNumber}</Text> : null}
            {job.sumAssured ? <Text style={[bbl.meta, { color: '#1a9e6b', fontWeight: '600' }]}>{job.sumAssured}</Text> : null}
          </View>
        ) : null}
        <Text style={bbl.date}>{date}</Text>
      </TouchableOpacity>
      {job.photoUris.length > 0 && (
        <Image source={{ uri: job.photoUris[0] }} style={bbl.thumb} />
      )}
    </View>
  );
}

const bbl = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, marginBottom: 10, gap: 8 },
  bubble: { flex: 1, backgroundColor: T.peach, borderRadius: 18, borderTopLeftRadius: 4, padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  visitTag: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  pill: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  pillText: { fontSize: 9, fontWeight: '700' },
  name: { fontSize: 15, fontWeight: '700', color: T.peachText, marginBottom: 4 },
  metaRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  meta: { fontSize: 12, color: T.peachText, opacity: 0.8 },
  date: { fontSize: 10, color: T.peachText, opacity: 0.5 },
  thumb: { width: 56, height: 56, borderRadius: 12, marginTop: 4 },
});

// ─── Bottom bar ───────────────────────────────────────────────────────────────
function BottomBar({ onNew, count }: { onNew: () => void; count: number }) {
  return (
    <View style={bar.wrap}>
      <TouchableOpacity style={bar.plus} onPress={onNew}>
        <Text style={bar.plusText}>+</Text>
      </TouchableOpacity>
      <View style={bar.input}>
        <Text style={bar.placeholder}>{count === 0 ? 'Start a new visit...' : 'Add another visit...'}</Text>
        <Text style={bar.mic}>🎤</Text>
      </View>
      {/* Orb — solid navy, no gradient */}
      <TouchableOpacity style={bar.orb} onPress={onNew} activeOpacity={0.85}>
        <View style={bar.orbInner}>
          {[8, 14, 10, 16, 9].map((h, i) => (
            <View key={i} style={{ width: 3, height: h, borderRadius: 2, backgroundColor: '#fff', opacity: 0.9 }} />
          ))}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const bar = StyleSheet.create({
  wrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12,
    backgroundColor: T.bg, borderTopWidth: 1, borderTopColor: T.border, gap: 10,
  },
  plus: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  plusText: { fontSize: 22, color: T.muted },
  input: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: T.bgSoft, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
  },
  placeholder: { fontSize: 15, color: T.muted },
  mic: { fontSize: 16, opacity: 0.5 },
  orb: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden', elevation: 6 },
  orbInner: {
    flex: 1, backgroundColor: T.navy,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 3,
  },
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router = useRouter();
  const { jobs, updateStatus, deleteJob } = useJobsStore();

  const handleNew = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/job/camera');
  }, [router]);

  const handlePress = useCallback((job: Job) => {
    const next = STATUSES[(STATUSES.indexOf(job.status) + 1) % STATUSES.length];
    Alert.alert(
      job.holderName || 'Field Visit',
      [job.policyNumber && `Policy: ${job.policyNumber}`, job.sumAssured && `Sum Assured: ${job.sumAssured}`, `Status: ${job.status} → ${next}`].filter(Boolean).join('\n'),
      [{ text: 'Cancel', style: 'cancel' }, { text: `Mark "${next}"`, onPress: () => { updateStatus(job.id, next); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }]
    );
  }, [updateStatus]);

  const handleDelete = useCallback((job: Job) => {
    Alert.alert('Delete Visit', `Delete "${job.holderName || 'this visit'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteJob(job.id) },
    ]);
  }, [deleteJob]);

  if (jobs.length === 0) return <Splash onNew={handleNew} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Sarvam header */}
      <View style={hdr.wrap}>
        <Text style={hdr.menu}>≡</Text>
        {/* mark + wordmark */}
        <View style={hdr.brandRow}>
          <Image source={SARVAM_MONOGRAM_BLACK} style={hdr.mark} resizeMode="contain" />
          <Image source={SARVAM_WORDMARK_BLACK} style={hdr.wordmark} resizeMode="contain" />
          <View style={hdr.badge}><Text style={hdr.badgeText}>LIC ↓</Text></View>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={hdr.iconBtn} onPress={handleNew}>
          <Text style={hdr.iconText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={hdr.statsRow}>
        {(['Pending', 'In Progress', 'Done'] as JobStatus[]).map(s => (
          <View key={s} style={[hdr.chip, { backgroundColor: STATUS[s].bg }]}>
            <Text style={[hdr.chipN, { color: STATUS[s].fg }]}>{jobs.filter(j => j.status === s).length}</Text>
            <Text style={[hdr.chipL, { color: STATUS[s].fg }]}>{s}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(j) => j.id}
        renderItem={({ item }) => <JobBubble job={item} onPress={() => handlePress(item)} onDelete={() => handleDelete(item)} />}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      <BottomBar onNew={handleNew} count={jobs.length} />
    </SafeAreaView>
  );
}

const hdr = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: T.border, gap: 10,
  },
  menu: { fontSize: 20, color: T.text },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { width: 26, height: 26 },
  wordmark: { width: 80, height: 22 },
  badge: { backgroundColor: '#F0F0F0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, color: T.muted, fontWeight: '600' },
  iconBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20, color: T.text, lineHeight: 24 },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  chip: { flex: 1, borderRadius: 12, paddingVertical: 8, alignItems: 'center' },
  chipN: { fontSize: 18, fontWeight: '800' },
  chipL: { fontSize: 9, fontWeight: '600', marginTop: 1 },
});
