/**
 * Home — 1:1 port of akshar-frontend/src/app/dashboard/page.tsx for mobile.
 * Tatva patterns preserved:
 *   - <Header type="main"> with left title + primary actions right + divider
 *   - Vertical <Card> for Upload (image on top, heading, description, clickable)
 *   - heading-lg / heading-md / heading-sm / body-md text variants
 *   - Decorative Indic-script strip at the bottom edge
 *   - Empty state mirrors the Akshar /upload-page.svg flow
 */
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, Image, Alert, ScrollView, Modal,
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
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

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
        <EmptyState onStart={handleStart} onLearnMore={() => setHowItWorksOpen(true)} />
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

      {/* How it works — content modal reached from the empty state */}
      <HowItWorksModal
        visible={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
        onStart={() => {
          setHowItWorksOpen(false);
          handleStart();
        }}
      />
    </SafeAreaView>
  );
}

/* ─── Empty state — mirrors Akshar /upload-page.svg centered flow ──────────── */
function EmptyState({
  onStart,
  onLearnMore,
}: {
  onStart: () => void;
  onLearnMore: () => void;
}) {
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
        <TouchableOpacity style={e.secondary} onPress={onLearnMore} activeOpacity={0.8}>
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

/* ─── How it works — drawer-style modal explaining the Akshar-for-LIC flow ──── */
type Step = {
  num: string;
  icon: 'camera' | 'sparkle' | 'eye' | 'check-circle';
  title: string;
  body: string;
};

const HOW_IT_WORKS_STEPS: Step[] = [
  {
    num: '01',
    icon: 'camera',
    title: 'Capture or upload',
    body:
      'Shoot every page of the claim form with your camera, or pick an existing PDF or image from your device. Add as many pages as the visit needs — they all ride in a single upload.',
  },
  {
    num: '02',
    icon: 'sparkle',
    title: 'Automatic extraction',
    body:
      'Sarvam Vision reads each page, detects the document language, and pulls out structured claim data — policy number, claimant, sum assured, bank details and the rest.',
  },
  {
    num: '03',
    icon: 'eye',
    title: 'Review in seconds',
    body:
      'Verify the auto-filled LIC Claim Form, fix anything the model missed, and mark the visit as handwritten if needed. Every field is editable before submit.',
  },
  {
    num: '04',
    icon: 'check-circle',
    title: 'Submit the visit',
    body:
      'The visit shows up on your dashboard the moment you submit, ready to forward on to the back-office for processing and validation.',
  },
];

function HowItWorksModal({
  visible,
  onClose,
  onStart,
}: {
  visible: boolean;
  onClose: () => void;
  onStart: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={h.safe}>
        <View style={h.header}>
          <View style={h.headerLeft}>
            <View style={h.brandMark}>
              <SvgXml xml={AKSHAR_LOGO_SVG} width={18} height={18} color={T.orange} />
            </View>
            <Text style={h.headerTitle}>How it works</Text>
          </View>
          <TouchableOpacity
            style={h.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={18} color={T.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={s.divider} />

        <ScrollView
          contentContainerStyle={h.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={h.hero}>Akshar for LIC, in four steps.</Text>
          <Text style={h.heroSub}>
            A field-agent workflow built for the pace of a real policyholder visit — every
            form captured, extracted, and filed in under a minute.
          </Text>

          <View style={h.steps}>
            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <View key={step.num} style={h.stepRow}>
                <View style={h.stepRail}>
                  <View style={h.stepBadge}>
                    <Icon name={step.icon} size={18} color={T.orange} strokeWidth={2} />
                  </View>
                  {idx < HOW_IT_WORKS_STEPS.length - 1 && <View style={h.stepLine} />}
                </View>
                <View style={h.stepBody}>
                  <Text style={h.stepNum}>Step {step.num}</Text>
                  <Text style={h.stepTitle}>{step.title}</Text>
                  <Text style={h.stepText}>{step.body}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={h.noteCard}>
            <Icon name="shield" size={16} color={T.orange} strokeWidth={2} />
            <Text style={h.noteText}>
              Visits stay on your device until you submit. Nothing is shared back to the
              back-office without your review.
            </Text>
          </View>

          <View style={{ height: SPACE.xxl }} />
        </ScrollView>

        <View style={h.footer}>
          <TouchableOpacity style={h.footerBtn} onPress={onStart} activeOpacity={0.88}>
            <Text style={h.footerBtnText}>Start a visit</Text>
            <Icon name="arrow-right" size={16} color="#fff" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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

const h = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACE.lg, paddingTop: SPACE.md, paddingBottom: SPACE.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  brandMark: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: T.orangeSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18, fontWeight: '600', color: T.text, letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: T.bgMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingHorizontal: SPACE.lg, paddingTop: SPACE.lg },

  hero: {
    fontSize: 26, fontWeight: '700', color: T.text,
    letterSpacing: -0.6, lineHeight: 32,
  },
  heroSub: {
    fontSize: 14, color: T.textSoft,
    marginTop: SPACE.sm, marginBottom: SPACE.xl,
    lineHeight: 21,
  },

  steps: { gap: 0 },
  stepRow: { flexDirection: 'row', gap: SPACE.md, paddingBottom: SPACE.lg },
  stepRail: { alignItems: 'center', width: 32 },
  stepBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: T.orangeSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  stepLine: {
    flex: 1, width: 2, marginTop: 6,
    backgroundColor: T.borderSoft,
  },
  stepBody: { flex: 1, paddingTop: 2 },
  stepNum: {
    fontSize: 11, fontWeight: '700', color: T.orange,
    letterSpacing: 0.6, textTransform: 'uppercase',
  },
  stepTitle: {
    fontSize: 17, fontWeight: '600', color: T.text,
    letterSpacing: -0.3, marginTop: 2, marginBottom: 4,
  },
  stepText: {
    fontSize: 14, color: T.textSoft, lineHeight: 21,
  },

  noteCard: {
    flexDirection: 'row', gap: SPACE.sm,
    backgroundColor: T.orangeSoft,
    borderRadius: RADIUS.md,
    padding: SPACE.md,
    marginTop: SPACE.sm,
  },
  noteText: {
    flex: 1, fontSize: 13, color: T.orangeText, lineHeight: 19,
  },

  footer: {
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.md,
    paddingBottom: SPACE.md,
    borderTopWidth: 1,
    borderTopColor: T.borderSoft,
    backgroundColor: T.bg,
  },
  footerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    backgroundColor: T.dark,
    paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: RADIUS.pill,
  },
  footerBtnText: {
    color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: -0.1,
  },
});
