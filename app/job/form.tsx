import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useJobsStore, type VisitType } from '../../store/jobs.store';
import { SARVAM_MONOGRAM_BLACK, SARVAM_WORDMARK_BLACK } from '../../assets/sarvam-logo';

const C = {
  bg: '#F7F5F2',
  white: '#FFFFFF',
  text: '#1A1A1A',
  muted: '#9A9A9A',
  border: '#EBEBEB',
  orange: '#E8612A',
  peach: '#FBE8D9',
  peachText: '#7A3A18',
  navy: '#1a3a6b',
  gold: '#f5c518',
};

const VISIT_TYPES: VisitType[] = [
  'New Proposal', 'Premium Collection', 'Claim Survey',
  'Policy Revival', 'Maturity Collection', 'Death Claim', 'Other',
];

export default function JobFormScreen() {
  const router = useRouter();
  const { draftPhotoUris, draftExtracted, draftDocTitle, draftHandwritten, clearDraft, addJob } = useJobsStore();

  const [visitType, setVisitType] = useState<VisitType>('New Proposal');
  const [policyNumber, setPolicyNumber] = useState(draftExtracted?.policyNumber ?? '');
  const [holderName, setHolderName] = useState(draftExtracted?.holderName ?? '');
  const [sumAssured, setSumAssured] = useState(draftExtracted?.sumAssured ?? '');
  const [agentCode, setAgentCode] = useState('');
  const [branch, setBranch] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!holderName.trim() && !policyNumber.trim()) {
      Alert.alert('Required', 'Enter the policyholder name or policy number.');
      return;
    }
    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addJob({
        visitType,
        policyNumber: policyNumber.trim(),
        holderName: holderName.trim(),
        sumAssured: sumAssured.trim(),
        agentCode: agentCode.trim(),
        branch: branch.trim(),
        notes: notes.trim(),
        docTitle: draftDocTitle,
        handwritten: draftHandwritten,
        photoUris: draftPhotoUris,
        rawExtractedText: draftExtracted?.rawText ?? '',
      });
      clearDraft();
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  }, [visitType, policyNumber, holderName, sumAssured, agentCode, branch, notes, draftPhotoUris, draftExtracted]);

  const hasAutoFill = !!(draftExtracted?.policyNumber || draftExtracted?.holderName || draftExtracted?.sumAssured);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Sarvam header */}
        <View style={s.header}>
          <Text style={s.menuIcon}>≡</Text>
          <View style={s.headerCenter}>
            <Image source={SARVAM_MONOGRAM_BLACK} style={s.mark} resizeMode="contain" />
            <Image source={SARVAM_WORDMARK_BLACK} style={s.brand} resizeMode="contain" />
            <View style={s.badge}>
              <Text style={s.badgeText}>LIC Field</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* OCR banner as a "message bubble" */}
          {hasAutoFill && (
            <View style={s.bubbleWrap}>
              <View style={s.bubbleBot}>
                <Text style={s.bubbleIcon}>✦</Text>
                <Text style={s.bubbleText}>
                  I found policy details in your photos. Please verify and edit below.
                </Text>
              </View>
            </View>
          )}

          {/* Photo strip */}
          {draftPhotoUris.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoStrip}>
              {draftPhotoUris.map((uri, i) => (
                <Image key={i} source={{ uri }} style={s.photoThumb} />
              ))}
            </ScrollView>
          )}

          {/* Visit type chips */}
          <Text style={s.sectionLabel}>Visit Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
            {VISIT_TYPES.map((t) => {
              const active = visitType === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[s.chip, active && s.chipActive]}
                  onPress={() => setVisitType(t)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.chipText, active && s.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Fields */}
          <Text style={s.sectionLabel}>Policy Details</Text>
          <View style={s.card}>
            <Field label="Policy Number" placeholder="e.g. 123456789" value={policyNumber} onChangeText={setPolicyNumber} ai={!!draftExtracted?.policyNumber} />
            <Sep />
            <Field label="Policyholder Name" placeholder="Full name" value={holderName} onChangeText={setHolderName} ai={!!draftExtracted?.holderName} />
            <Sep />
            <Field label="Sum Assured" placeholder="e.g. ₹5,00,000" value={sumAssured} onChangeText={setSumAssured} ai={!!draftExtracted?.sumAssured} />
          </View>

          <Text style={s.sectionLabel}>Agent Details</Text>
          <View style={s.card}>
            <Field label="Agent Code" placeholder="Your LIC agent code" value={agentCode} onChangeText={setAgentCode} />
            <Sep />
            <Field label="Branch / Division" placeholder="e.g. Mumbai North" value={branch} onChangeText={setBranch} />
          </View>

          <Text style={s.sectionLabel}>Remarks</Text>
          <View style={s.card}>
            <TextInput
              style={s.notesInput}
              placeholder="Visit observations, next steps…"
              placeholderTextColor="#bbb"
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
              numberOfLines={4}
            />
          </View>

          {/* Submit — dark pill like Sarvam */}
          <TouchableOpacity
            style={[s.submitBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.88}
          >
            <Text style={s.submitText}>{saving ? 'Saving…' : 'Submit Visit Report'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Sep() {
  return <View style={{ height: 1, backgroundColor: '#F0F0F0', marginHorizontal: -16 }} />;
}

function Field({
  label, placeholder, value, onChangeText, ai, multiline,
}: {
  label: string; placeholder: string; value: string;
  onChangeText: (v: string) => void; ai?: boolean; multiline?: boolean;
}) {
  return (
    <View style={f.wrap}>
      <View style={f.row}>
        <Text style={f.label}>{label}</Text>
        {ai && (
          <View style={f.aiBadge}>
            <Text style={f.aiText}>AI filled</Text>
          </View>
        )}
      </View>
      <TextInput
        style={[f.input, ai && f.inputAi, multiline && f.inputMulti]}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.white },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.white,
  },
  menuIcon: { fontSize: 20, color: C.text, width: 36 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  badge: { backgroundColor: '#F0F0F0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, color: C.muted, fontWeight: '600' },
  closeBtn: { fontSize: 18, color: C.muted, width: 36, textAlign: 'right' },

  scroll: { padding: 16, paddingBottom: 48, backgroundColor: C.bg },

  bubbleWrap: { marginBottom: 16 },
  bubbleBot: {
    backgroundColor: C.peach, borderRadius: 18, borderTopLeftRadius: 4,
    padding: 14, flexDirection: 'row', gap: 8, alignItems: 'flex-start',
  },
  bubbleIcon: { fontSize: 14, color: C.orange, marginTop: 1 },
  bubbleText: { flex: 1, fontSize: 14, color: C.peachText, lineHeight: 20 },

  photoStrip: { marginBottom: 16 },
  photoThumb: { width: 68, height: 68, borderRadius: 12, marginRight: 8 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 8, marginTop: 16,
  },

  chipScroll: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.white, marginRight: 8,
  },
  chipActive: { backgroundColor: C.orange, borderColor: C.orange },
  chipText: { fontSize: 13, fontWeight: '500', color: '#666' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  card: {
    backgroundColor: C.white, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },

  notesInput: { fontSize: 15, color: C.text, paddingVertical: 12, minHeight: 90 },

  submitBtn: { marginTop: 28, borderRadius: 14, paddingVertical: 16, alignItems: 'center', backgroundColor: '#1A1A1A' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 10 },
  cancelText: { color: C.muted, fontSize: 15 },
});

const f = StyleSheet.create({
  wrap: { paddingVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  label: { fontSize: 11, fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  aiBadge: { backgroundColor: C.peach, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  aiText: { fontSize: 10, color: C.orange, fontWeight: '700' },
  input: { fontSize: 15, color: C.text },
  inputAi: { color: C.orange, fontWeight: '500' },
  inputMulti: { minHeight: 56 },
});
