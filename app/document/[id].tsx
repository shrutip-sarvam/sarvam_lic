import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useDocumentsStore } from '../../store/documents.store';
import { ExtractedBlock } from '../../types/block.types';
import { SourceViewer } from '../../components/document/SourceViewer';
import { ExtractedBlocks } from '../../components/document/ExtractedBlocks';
import { CorrectionPanel } from '../../components/document/CorrectionPanel';
import { FormatSelector } from '../../components/shared/FormatSelector';
import { shareDocument } from '../../services/export.service';
import { applyAgentCorrection } from '../../services/sarvam.api';
import { useSettingsStore } from '../../store/settings.store';
import { COLORS } from '../../constants/theme';

export default function DocumentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { documents, updateDocument } = useDocumentsStore();
  const { outputFormat, setOutputFormat } = useSettingsStore();

  const doc = documents.find((d) => d.id === id);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showCorrection, setShowCorrection] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  if (!doc) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>Document not found.</Text>
      </SafeAreaView>
    );
  }

  const handleBlockSelect = (block: ExtractedBlock) => {
    setSelectedBlockId(block.id);
    setCurrentPage(block.pageIndex);
    Haptics.selectionAsync();
  };

  const handleBlockLongPress = (block: ExtractedBlock) => {
    Alert.alert(block.type, block.content.substring(0, 80) + '...', [
      { text: 'Edit', onPress: () => router.push(`/document/edit/${doc.id}`) },
      { text: 'Close', style: 'cancel' },
    ]);
  };

  const handleExport = () => {
    Alert.alert('Export', 'Choose export format', [
      { text: 'Copy to clipboard', onPress: () => {} },
      { text: 'Share file', onPress: () => shareDocument(doc, outputFormat) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleApplyCorrection = async (instruction: string, scope: string) => {
    setIsApplying(true);
    try {
      await applyAgentCorrection({ documentId: doc.id, instruction, scope: scope as 'full' });
      Alert.alert('Correction applied', 'The agent has updated the document.');
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setIsApplying(false);
      setShowCorrection(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen
        options={{
          title: doc.title,
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowCorrection(true)} style={{ marginRight: 8 }}>
              <Text style={{ color: COLORS.accent, fontWeight: '700' }}>✍ Correct</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scroll} stickyHeaderIndices={[0]}>
        {/* Source viewer */}
        <SourceViewer
          pages={doc.pages}
          currentPageIndex={currentPage}
          blocks={doc.blocks}
          selectedBlockId={selectedBlockId}
          onBlockTap={handleBlockSelect}
          onPageChange={setCurrentPage}
        />

        {/* Format selector */}
        <View style={styles.formatRow}>
          <FormatSelector value={outputFormat} onChange={setOutputFormat} />
        </View>

        {/* Extracted blocks */}
        <View style={styles.blocksArea}>
          <ExtractedBlocks
            blocks={doc.blocks}
            selectedBlockId={selectedBlockId}
            onBlockSelect={handleBlockSelect}
            onBlockLongPress={handleBlockLongPress}
            onExport={handleExport}
          />
        </View>
      </ScrollView>

      {showCorrection && (
        <CorrectionPanel
          onApply={handleApplyCorrection}
          onClose={() => setShowCorrection(false)}
          isApplying={isApplying}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { flex: 1 },
  formatRow: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.grey[200] },
  blocksArea: { flex: 1, minHeight: 400 },
  notFound: { textAlign: 'center', marginTop: 80, fontSize: 16, color: COLORS.grey[500] },
});
