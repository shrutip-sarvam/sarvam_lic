import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSettingsStore } from '../../store/settings.store';
import { useDocumentsStore } from '../../store/documents.store';
import { FormatSelector } from '../../components/shared/FormatSelector';
import { LANGUAGES } from '../../constants/languages';
import { COLORS } from '../../constants/theme';

export default function SettingsScreen() {
  const {
    outputFormat,
    defaultLanguage,
    defaultInstructions,
    setOutputFormat,
    setDefaultLanguage,
    setDefaultInstructions,
  } = useSettingsStore();
  const { documents } = useDocumentsStore();
  const [instructions, setInstructions] = useState(defaultInstructions);

  const clearAll = () => {
    Alert.alert('Clear All Documents?', 'This will delete all locally cached documents. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: () => useDocumentsStore.getState().documents.forEach((d) => useDocumentsStore.getState().deleteDocument(d.id)) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Output format */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Output Format</Text>
          <FormatSelector value={outputFormat} onChange={setOutputFormat} />
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Language</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.langRow}>
              <TouchableOpacity
                style={[styles.langBtn, defaultLanguage === 'auto' && styles.langBtnActive]}
                onPress={() => setDefaultLanguage('auto')}
              >
                <Text style={[styles.langText, defaultLanguage === 'auto' && styles.langTextActive]}>
                  🔍 Auto-detect
                </Text>
              </TouchableOpacity>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langBtn, defaultLanguage === lang.code && styles.langBtnActive]}
                  onPress={() => setDefaultLanguage(lang.code)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${lang.name}`}
                >
                  <Text style={[styles.langNative, defaultLanguage === lang.code && styles.langTextActive]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={styles.langCode}>{lang.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Default instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Processing Instructions</Text>
          <Text style={styles.sectionSub}>Applied to every new document automatically.</Text>
          <TextInput
            style={styles.instructionInput}
            multiline
            numberOfLines={4}
            placeholder='e.g. "Correct all spelling errors in Hindi text"'
            placeholderTextColor={COLORS.grey[400]}
            value={instructions}
            onChangeText={setInstructions}
            onBlur={() => setDefaultInstructions(instructions)}
            accessibilityLabel="Default processing instructions"
          />
        </View>

        {/* Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <View style={styles.storageRow}>
            <Text style={styles.storageCount}>{documents.length} document{documents.length !== 1 ? 's' : ''} cached</Text>
            <TouchableOpacity style={styles.clearBtn} onPress={clearAll} accessibilityRole="button" accessibilityLabel="Clear all cached documents">
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.about}>Akshar by Sarvam AI — Intelligent Document Digitisation for India.</Text>
          <Text style={styles.about}>Powered by Sarvam Vision · 23 Indian languages supported.</Text>
          <Text style={[styles.about, { color: COLORS.accent, marginTop: 4 }]}>akshar.sarvam.ai</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  container: { padding: 20, gap: 24, paddingBottom: 60 },
  pageTitle: { fontSize: 26, fontWeight: '900', color: COLORS.primary },
  section: { gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.grey[500], textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionSub: { fontSize: 12, color: COLORS.grey[400] },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: COLORS.grey[200], backgroundColor: COLORS.white, alignItems: 'center', minWidth: 70 },
  langBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '11' },
  langText: { fontSize: 12, color: COLORS.grey[600] },
  langNative: { fontSize: 14, fontWeight: '600', color: COLORS.grey[700] },
  langCode: { fontSize: 9, color: COLORS.grey[400] },
  langTextActive: { color: COLORS.primary, fontWeight: '700' },
  instructionInput: {
    borderWidth: 1, borderColor: COLORS.grey[200], borderRadius: 12,
    padding: 12, fontSize: 14, color: COLORS.grey[800],
    backgroundColor: COLORS.white, minHeight: 100, textAlignVertical: 'top',
  },
  storageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.grey[200] },
  storageCount: { fontSize: 14, color: COLORS.grey[700] },
  clearBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: COLORS.error + '15' },
  clearText: { color: COLORS.error, fontWeight: '700', fontSize: 12 },
  about: { fontSize: 12, color: COLORS.grey[500], lineHeight: 18 },
});
