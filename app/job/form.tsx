/**
 * Submit step — the entire "form" is a single Name field.
 *
 * Frictionless-by-design: after the agent finishes capturing photos the
 * only thing left before the visit hits the Recent list is giving it a
 * title. Everything else (claim type, policy number, bank details) used
 * to live here and has been moved off the critical path.
 *
 * Flow: Home → Camera → this screen → Home (with the visit in Recent).
 */
import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, StatusBar, Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useJobsStore } from '../../store/jobs.store';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT_FAMILY } from '../../components/ui/tokens';

export default function SubmitScreen() {
  const router = useRouter();
  const { draftPhotoUris, addJob, clearDraft } = useJobsStore();

  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pageCount = draftPhotoUris.length;
  const today = useMemo(
    () => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    [],
  );

  const handleUpload = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Give this visit a name so you can find it later.');
      return;
    }
    if (submitting) return;

    setSubmitting(true);

    // Persist as a Job. Every field other than the bare minimum is
    // defaulted — agents can enrich later from the Recent list.
    addJob({
      docTitle: trimmed,
      handwritten: false,
      photoUris: draftPhotoUris,
      rawExtractedText: '',
      claimType: 'Death Claim',
      dateOfEvent: '',
      policyNumber: '',
      holderName: trimmed,
      sumAssured: '',
      dateOfCommencement: '',
      claimantName: trimmed,
      claimantRelation: 'Self',
      claimantPhone: '',
      bankAccount: '',
      bankIfsc: '',
      bankName: '',
      agentCode: '',
      branchCode: '',
      notes: '',
    });

    clearDraft();
    router.replace('/(tabs)');
  }, [name, submitting, addJob, draftPhotoUris, clearDraft, router]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Tatva header — back, title, divider */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={22} color={T.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>New visit</Text>
        <View style={s.iconBtn} />
      </View>
      <View style={s.divider} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Capture summary — what the agent just shot */}
          <View style={s.summary}>
            <View style={s.summaryRow}>
              <View style={s.summaryIcon}>
                <Icon name="file" size={18} color={T.orange} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.summaryTitle}>
                  {pageCount} {pageCount === 1 ? 'page' : 'pages'} captured
                </Text>
                <Text style={s.summaryMeta}>{today}</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.replace('/job/camera')}
                activeOpacity={0.7}
              >
                <Text style={s.retake}>Retake</Text>
              </TouchableOpacity>
            </View>

            {pageCount > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.thumbStrip}
                style={{ marginTop: SPACE.md }}
              >
                {draftPhotoUris.map((uri, i) => (
                  <View key={uri + i} style={s.thumbWrap}>
                    <Image source={{ uri }} style={s.thumb} />
                    <View style={s.thumbBadge}>
                      <Text style={s.thumbBadgeText}>{i + 1}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* The single input */}
          <View style={{ marginTop: SPACE.xl }}>
            <Text style={s.label}>Name this visit</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Rajesh Kumar"
              placeholderTextColor={T.textFaint}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleUpload}
            />
            <Text style={s.helper}>
              You can edit claim details later from the Recent list.
            </Text>
          </View>
        </ScrollView>

        {/* Sticky Upload button — this is the final click */}
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.uploadBtn, (!name.trim() || submitting) && s.uploadBtnDisabled]}
            onPress={handleUpload}
            disabled={!name.trim() || submitting}
            activeOpacity={0.88}
          >
            <Text style={s.uploadText}>{submitting ? 'Uploading…' : 'Upload'}</Text>
            {!submitting && <Icon name="arrow-right" size={16} color="#fff" strokeWidth={2.2} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.md,
    backgroundColor: T.bg,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 16, fontFamily: FONT_FAMILY.semibold, fontWeight: '600',
    color: T.text, letterSpacing: -0.2,
  },
  divider: { height: 1, backgroundColor: T.borderSoft },

  scroll: { padding: SPACE.lg },

  summary: {
    backgroundColor: T.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: T.border,
    padding: SPACE.md,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
  summaryIcon: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: T.orangeSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 15, fontFamily: FONT_FAMILY.semibold, fontWeight: '600',
    color: T.text, letterSpacing: -0.2,
  },
  summaryMeta: {
    fontSize: 12, fontFamily: FONT_FAMILY.regular, fontWeight: '400',
    color: T.textMuted, marginTop: 1,
  },
  retake: {
    fontSize: 13, fontFamily: FONT_FAMILY.semibold, fontWeight: '600',
    color: T.orange,
  },

  thumbStrip: { gap: SPACE.sm, paddingVertical: 4 },
  thumbWrap: { position: 'relative' },
  thumb: {
    width: 72, height: 88,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: T.border,
    backgroundColor: T.bgMuted,
  },
  thumbBadge: {
    position: 'absolute', top: 4, left: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1,
  },
  thumbBadgeText: {
    color: '#fff',
    fontSize: 10, fontFamily: FONT_FAMILY.bold, fontWeight: '700',
  },

  label: {
    fontSize: 13, fontFamily: FONT_FAMILY.semibold, fontWeight: '600',
    color: T.textSoft, marginBottom: SPACE.sm,
  },
  input: {
    borderWidth: 1, borderColor: T.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACE.md, paddingVertical: 13,
    fontSize: 16, fontFamily: FONT_FAMILY.regular, fontWeight: '400',
    color: T.text, backgroundColor: T.bg,
  },
  helper: {
    fontSize: 12, fontFamily: FONT_FAMILY.regular, fontWeight: '400',
    color: T.textMuted, marginTop: SPACE.sm,
  },

  footer: {
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.md, paddingBottom: SPACE.md,
    borderTopWidth: 1, borderTopColor: T.borderSoft,
    backgroundColor: T.bg,
  },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    backgroundColor: T.dark,
    paddingVertical: 15, paddingHorizontal: 20,
    borderRadius: RADIUS.pill,
  },
  uploadBtnDisabled: { backgroundColor: T.borderStrong },
  uploadText: {
    color: '#fff', fontSize: 15,
    fontFamily: FONT_FAMILY.semibold, fontWeight: '600', letterSpacing: -0.1,
  },
});
