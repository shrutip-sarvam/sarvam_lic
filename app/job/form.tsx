/**
 * LIC Claim Form — real fields matching an actual LIC claim.
 * Pre-filled from Sarvam Vision OCR. User reviews/edits then saves.
 * Clean Akshar-style layout: sectioned fields, pill inputs, no emojis.
 */
import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useJobsStore, type ClaimType } from '../../store/jobs.store';
import { Icon } from '../../components/ui/Icon';
import { T, SPACE, RADIUS, FONT } from '../../components/ui/tokens';

const CLAIM_TYPES: ClaimType[] = [
  'Death Claim', 'Maturity Claim', 'Survival Benefit', 'Disability Claim', 'Surrender Claim',
];

const RELATIONS = ['Self', 'Spouse', 'Son', 'Daughter', 'Nominee', 'Other'];

export default function FormScreen() {
  const router = useRouter();
  const {
    draftPhotoUris, draftExtracted, draftDocTitle, draftHandwritten,
    addJob, clearDraft,
  } = useJobsStore();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Policy (from OCR)
  const [policyNumber, setPolicyNumber] = useState(draftExtracted?.policyNumber ?? '');
  const [holderName, setHolderName] = useState(draftExtracted?.holderName ?? '');
  const [sumAssured, setSumAssured] = useState(draftExtracted?.sumAssured ?? '');
  const [dateOfCommencement, setDateOfCommencement] = useState('');

  // Claim
  const [claimType, setClaimType] = useState<ClaimType>('Death Claim');
  const [dateOfEvent, setDateOfEvent] = useState(today);
  const [causeOfDeath, setCauseOfDeath] = useState('');

  // Claimant
  const [claimantName, setClaimantName] = useState('');
  const [claimantRelation, setClaimantRelation] = useState('Self');
  const [claimantPhone, setClaimantPhone] = useState('');

  // Bank
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');

  // Agent
  const [agentCode, setAgentCode] = useState('');
  const [branchCode, setBranchCode] = useState('');

  const [notes, setNotes] = useState('');

  const handleSave = useCallback(() => {
    if (!policyNumber.trim()) { Alert.alert('Missing info', 'Policy number is required.'); return; }
    if (!holderName.trim()) { Alert.alert('Missing info', 'Life assured name is required.'); return; }
    if (!claimantName.trim()) { Alert.alert('Missing info', 'Claimant name is required.'); return; }

    addJob({
      docTitle: draftDocTitle || holderName,
      handwritten: draftHandwritten,
      photoUris: draftPhotoUris,
      rawExtractedText: draftExtracted?.rawText ?? '',
      claimType,
      dateOfEvent,
      causeOfDeath: claimType === 'Death Claim' ? causeOfDeath : undefined,
      policyNumber: policyNumber.trim(),
      holderName: holderName.trim(),
      sumAssured: sumAssured.trim(),
      dateOfCommencement,
      claimantName: claimantName.trim(),
      claimantRelation,
      claimantPhone: claimantPhone.trim(),
      bankAccount: bankAccount.trim(),
      bankIfsc: bankIfsc.trim().toUpperCase(),
      bankName: bankName.trim(),
      agentCode: agentCode.trim(),
      branchCode: branchCode.trim(),
      notes: notes.trim(),
    });

    clearDraft();
    router.replace('/(tabs)');
  }, [
    policyNumber, holderName, claimantName, addJob, draftDocTitle, draftHandwritten, draftPhotoUris,
    draftExtracted, claimType, dateOfEvent, causeOfDeath, sumAssured, dateOfCommencement,
    claimantRelation, claimantPhone, bankAccount, bankIfsc, bankName, agentCode, branchCode, notes,
    clearDraft, router,
  ]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => router.back()}>
          <Icon name="chevron-left" size={22} color={T.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>LIC Claim Form</Text>
          <Text style={s.headerSub}>Review and complete</Text>
        </View>
        <View style={s.ocrPill}>
          <Icon name="sparkle" size={12} color={T.blue} strokeWidth={2} />
          <Text style={s.ocrPillText}>OCR filled</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Claim type */}
          <Section title="Claim Type">
            <ChipRow
              options={CLAIM_TYPES}
              value={claimType}
              onChange={(v) => setClaimType(v as ClaimType)}
            />
          </Section>

          {/* Policy */}
          <Section title="Policy Details">
            <Field
              label="Policy Number"
              value={policyNumber}
              onChangeText={setPolicyNumber}
              placeholder="e.g. 123456789"
              required
            />
            <Field
              label="Life Assured"
              value={holderName}
              onChangeText={setHolderName}
              placeholder="Full name"
              required
            />
            <Row>
              <Field
                label="Sum Assured"
                value={sumAssured}
                onChangeText={setSumAssured}
                placeholder="₹ 5,00,000"
                flex
              />
              <Field
                label="Date of Commencement"
                value={dateOfCommencement}
                onChangeText={setDateOfCommencement}
                placeholder="YYYY-MM-DD"
                flex
              />
            </Row>
          </Section>

          {/* Event */}
          <Section title={claimType === 'Death Claim' ? 'Death Details' : 'Event Details'}>
            <Row>
              <Field
                label={claimType === 'Death Claim' ? 'Date of Death' : 'Event Date'}
                value={dateOfEvent}
                onChangeText={setDateOfEvent}
                placeholder="YYYY-MM-DD"
                flex
              />
              {claimType === 'Death Claim' && (
                <Field
                  label="Cause of Death"
                  value={causeOfDeath}
                  onChangeText={setCauseOfDeath}
                  placeholder="e.g. Natural / Accident"
                  flex
                />
              )}
            </Row>
          </Section>

          {/* Claimant */}
          <Section title="Claimant Details">
            <Field
              label="Claimant Name"
              value={claimantName}
              onChangeText={setClaimantName}
              placeholder="Full name"
              required
            />
            <View style={s.field}>
              <Text style={s.label}>Relation to Life Assured</Text>
              <ChipRow
                options={RELATIONS}
                value={claimantRelation}
                onChange={setClaimantRelation}
              />
            </View>
            <Field
              label="Phone Number"
              value={claimantPhone}
              onChangeText={setClaimantPhone}
              placeholder="+91"
              keyboardType="phone-pad"
            />
          </Section>

          {/* Bank */}
          <Section title="Bank Details (for payout)">
            <Field
              label="Account Number"
              value={bankAccount}
              onChangeText={setBankAccount}
              placeholder="Bank account number"
              keyboardType="numeric"
            />
            <Row>
              <Field
                label="IFSC Code"
                value={bankIfsc}
                onChangeText={(v) => setBankIfsc(v.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                flex
                autoCapitalize="characters"
              />
              <Field
                label="Bank Name"
                value={bankName}
                onChangeText={setBankName}
                placeholder="e.g. SBI"
                flex
              />
            </Row>
          </Section>

          {/* Agent */}
          <Section title="Agent & Branch">
            <Row>
              <Field
                label="Agent Code"
                value={agentCode}
                onChangeText={setAgentCode}
                placeholder="Optional"
                flex
              />
              <Field
                label="Branch Code"
                value={branchCode}
                onChangeText={setBranchCode}
                placeholder="Optional"
                flex
              />
            </Row>
          </Section>

          {/* Notes */}
          <Section title="Additional Remarks">
            <TextInput
              style={[s.input, s.textarea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional information…"
              placeholderTextColor={T.textFaint}
              multiline
              textAlignVertical="top"
            />
          </Section>

          <View style={{ height: SPACE.xxl }} />
        </ScrollView>

        {/* Sticky footer */}
        <View style={s.footer}>
          <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.88}>
            <Icon name="check" size={16} color="#fff" strokeWidth={2.5} />
            <Text style={s.saveText}>Save Claim</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sec.wrap}>
      <Text style={sec.title}>{title}</Text>
      <View style={sec.body}>{children}</View>
    </View>
  );
}
const sec = StyleSheet.create({
  wrap: { marginBottom: SPACE.lg },
  title: { ...FONT.label, color: T.textMuted, marginBottom: SPACE.sm, marginLeft: 4 },
  body: {
    backgroundColor: T.bg,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: T.borderSoft,
    padding: SPACE.md,
    gap: SPACE.md,
  },
});

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: SPACE.sm }}>{children}</View>;
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  flex?: boolean;
  keyboardType?: any;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={[s.field, props.flex && { flex: 1 }]}>
      <Text style={s.label}>
        {props.label}
        {props.required && <Text style={{ color: T.red }}> *</Text>}
      </Text>
      <TextInput
        style={s.input}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={T.textFaint}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize ?? 'sentences'}
      />
    </View>
  );
}

function ChipRow({
  options, value, onChange,
}: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
    >
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            activeOpacity={0.8}
            style={[chip.base, selected ? chip.on : chip.off]}
          >
            <Text style={[chip.txt, selected ? chip.txtOn : chip.txtOff]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
const chip = StyleSheet.create({
  base: {
    paddingHorizontal: SPACE.md, paddingVertical: 8,
    borderRadius: RADIUS.pill, borderWidth: 1,
  },
  on: { backgroundColor: T.dark, borderColor: T.dark },
  off: { backgroundColor: T.bg, borderColor: T.border },
  txt: { ...FONT.small, fontWeight: '600' },
  txtOn: { color: '#fff' },
  txtOff: { color: T.textSoft },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bgMuted },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.md,
    backgroundColor: T.bg,
    borderBottomWidth: 1, borderBottomColor: T.borderSoft,
    gap: SPACE.sm,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...FONT.h3, color: T.text },
  headerSub: { ...FONT.tiny, color: T.textMuted, marginTop: 1 },
  ocrPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: T.blueSoft, borderRadius: RADIUS.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  ocrPillText: { ...FONT.tiny, color: T.blue, fontWeight: '700' },

  scroll: { padding: SPACE.lg },

  field: { gap: 6 },
  label: { ...FONT.small, fontWeight: '600', color: T.textSoft },
  input: {
    borderWidth: 1, borderColor: T.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACE.md, paddingVertical: 11,
    ...FONT.body, color: T.text, backgroundColor: T.bg,
  },
  textarea: { minHeight: 90, paddingTop: 12 },

  footer: {
    flexDirection: 'row', gap: SPACE.sm,
    paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md,
    backgroundColor: T.bg,
    borderTopWidth: 1, borderTopColor: T.borderSoft,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 13,
    borderRadius: RADIUS.pill, backgroundColor: T.bgMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { ...FONT.bodyStrong, color: T.text },
  saveBtn: {
    flex: 2, flexDirection: 'row', gap: 8,
    paddingVertical: 13, borderRadius: RADIUS.pill, backgroundColor: T.dark,
    alignItems: 'center', justifyContent: 'center',
  },
  saveText: { color: '#fff', ...FONT.bodyStrong },
});
