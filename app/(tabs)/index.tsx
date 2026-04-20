/**
 * Home / Dashboard — mirrors Akshar Vision dashboard design
 * Clean top bar, document list, floating upload button, empty state.
 */
import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, Image, Alert, Platform,
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

export default function HomeScreen() {
  const router = useRouter();
  const jobs = useJobsStore((s) => s.jobs);
  const deleteJob = useJobsStore((s) => s.deleteJob);

  const handleNew = useCallback(() => {
    router.push('/job/camera');
  }, [router]);

  const handleJobPress = useCallback((id: string) => {
    // Future: open job detail
  }, []);

  const handleJobDelete = useCallback((id: string, name: string) => {
    Alert.alert('Delete Document', `Remove "${name || 'this document'}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteJob(id) },
    ]);
  }, [deleteJob]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.iconBtn} accessibilityLabel="Menu">
          <Icon name="menu" size={22} color={T.text} />
        </TouchableOpacity>
        <View style={s.brandRow}>
          <Text style={s.brand}>sarvam</Text>
          <View style={s.licBadge}>
            <Text style={s.licBadgeText}>for LIC</Text>
          </View>
        </View>
        <TouchableOpacity style={s.avatar} accessibilityLabel="Profile">
          <Text style={s.avatarText}>A</Text>
        </TouchableOpacity>
      </View>

      {/* Page header */}
      <View style={s.pageHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.pageTitle}>Home</Text>
          <Text style={s.pageSub}>
            {jobs.length === 0
              ? 'Upload LIC documents to extract policy details'
              : `${jobs.length} ${jobs.length === 1 ? 'document' : 'documents'}`}
          </Text>
        </View>
        {jobs.length > 0 && (
          <TouchableOpacity style={s.uploadBtn} onPress={handleNew} activeOpacity={0.85}>
            <Icon name="plus" size={16} color="#fff" />
            <Text style={s.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List / empty state */}
      {jobs.length === 0 ? (
        <EmptyState onUpload={handleNew} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(j) => j.id}
          renderItem={({ item }) => (
            <DocumentCard
              job={item}
              onPress={() => handleJobPress(item.id)}
              onDelete={() => handleJobDelete(item.id, item.holderName || item.docTitle)}
            />
          )}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <View style={es.wrap}>
      <View style={es.iconCircle}>
        <Icon name="file" size={40} color={T.orange} strokeWidth={1.5} />
      </View>
      <Text style={es.title}>No documents yet</Text>
      <Text style={es.sub}>
        Upload LIC policy or claim documents to extract details automatically.
      </Text>
      <TouchableOpacity style={es.btn} onPress={onUpload} activeOpacity={0.85}>
        <Icon name="camera" size={18} color="#fff" />
        <Text style={es.btnText}>Upload Your First Document</Text>
      </TouchableOpacity>
      <Text style={es.hint}>Supports photos, PDF, JPEG, PNG up to 200MB</Text>
    </View>
  );
}

const es = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACE.xl },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: T.orangeSoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACE.xl,
  },
  title: { ...FONT.h2, color: T.text, marginBottom: SPACE.sm },
  sub: { ...FONT.body, color: T.textMuted, textAlign: 'center', maxWidth: 280, lineHeight: 20, marginBottom: SPACE.xl },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.dark, paddingHorizontal: 22, paddingVertical: 14,
    borderRadius: RADIUS.pill,
  },
  btnText: { color: '#fff', ...FONT.bodyStrong },
  hint: { ...FONT.small, color: T.textFaint, marginTop: SPACE.lg },
});

// ─── Document card ────────────────────────────────────────────────────────────
function DocumentCard({
  job, onPress, onDelete,
}: { job: Job; onPress: () => void; onDelete: () => void }) {
  const st = STATUS_STYLE[job.status];
  const date = new Date(job.createdAt);
  const dateLabel = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeLabel = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const title = job.holderName?.trim() || job.docTitle?.trim() || 'Untitled Document';

  return (
    <TouchableOpacity
      style={c.card}
      onPress={onPress}
      onLongPress={onDelete}
      activeOpacity={0.88}
    >
      {job.photoUris.length > 0 ? (
        <Image source={{ uri: job.photoUris[0] }} style={c.thumb} />
      ) : (
        <View style={[c.thumb, c.thumbPlaceholder]}>
          <Icon name="file" size={24} color={T.textMuted} />
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
          <View style={c.metaRow}>
            <Text style={c.metaKey}>Policy</Text>
            <Text style={c.metaVal} numberOfLines={1}>#{job.policyNumber}</Text>
          </View>
        ) : null}
        {job.sumAssured ? (
          <View style={c.metaRow}>
            <Text style={c.metaKey}>Sum</Text>
            <Text style={c.metaVal} numberOfLines={1}>{job.sumAssured}</Text>
          </View>
        ) : null}
        <View style={c.footerRow}>
          <Icon name="clock" size={12} color={T.textFaint} strokeWidth={1.5} />
          <Text style={c.date}>{dateLabel} · {timeLabel}</Text>
          {job.photoUris.length > 1 && (
            <>
              <View style={c.footerDot} />
              <Icon name="image" size={12} color={T.textFaint} strokeWidth={1.5} />
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
  thumb: { width: 68, height: 84, borderRadius: RADIUS.md, backgroundColor: T.bgMuted },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, marginBottom: 2 },
  title: { flex: 1, ...FONT.h3, color: T.text },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.sm },
  statusText: { ...FONT.tiny },
  formType: { ...FONT.small, color: T.textMuted, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  metaKey: { ...FONT.tiny, color: T.textFaint, width: 40 },
  metaVal: { ...FONT.small, color: T.textSoft, fontWeight: '500' },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  footerDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: T.textFaint, marginHorizontal: 4 },
  date: { ...FONT.tiny, color: T.textFaint },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md,
    borderBottomWidth: 1, borderBottomColor: T.borderSoft,
    gap: SPACE.sm,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  brandRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
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
  },
  avatarText: { ...FONT.bodyStrong, color: T.text },

  pageHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACE.lg, paddingTop: SPACE.lg, paddingBottom: SPACE.md,
    gap: SPACE.md,
  },
  pageTitle: { ...FONT.h1, color: T.text },
  pageSub: { ...FONT.small, color: T.textMuted, marginTop: 2 },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: T.dark,
    paddingHorizontal: SPACE.lg, paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  uploadBtnText: { color: '#fff', ...FONT.bodyStrong },

  listContent: { paddingHorizontal: SPACE.lg, paddingBottom: SPACE.xxl },
});
