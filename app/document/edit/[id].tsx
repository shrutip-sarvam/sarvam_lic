import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useDocumentsStore } from '../../../store/documents.store';
import { ExtractedBlock, BlockType } from '../../../types/block.types';
import { COLORS, BLOCK_TYPE_COLORS } from '../../../constants/theme';

const BLOCK_TYPES = Object.values(BlockType);
const MAX_UNDO_STACK = 20;

export default function EditDocumentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { documents, updateDocument } = useDocumentsStore();
  const doc = documents.find((d) => d.id === id);

  const [blocks, setBlocks] = useState<ExtractedBlock[]>(doc?.blocks ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const undoStack = useRef<ExtractedBlock[][]>([]);
  const redoStack = useRef<ExtractedBlock[][]>([]);

  const pushUndo = (prev: ExtractedBlock[]) => {
    undoStack.current = [...undoStack.current.slice(-MAX_UNDO_STACK), prev];
    redoStack.current = [];
  };

  const undo = () => {
    if (undoStack.current.length === 0) return;
    redoStack.current.push(blocks);
    setBlocks(undoStack.current.pop()!);
  };

  const redo = () => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push(blocks);
    setBlocks(redoStack.current.pop()!);
  };

  // Auto-save every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setIsSaving(true);
      updateDocument(id!, { blocks });
      setTimeout(() => setIsSaving(false), 800);
    }, 5000);
    return () => clearInterval(timer);
  }, [blocks, id]);

  const updateBlockContent = (blockId: string, content: string) => {
    setBlocks((prev) => {
      pushUndo(prev);
      return prev.map((b) => (b.id === blockId ? { ...b, content } : b));
    });
  };

  const relabelBlock = (blockId: string, type: BlockType) => {
    setBlocks((prev) => {
      pushUndo(prev);
      return prev.map((b) => (b.id === blockId ? { ...b, type } : b));
    });
  };

  const deleteBlock = (blockId: string) => {
    setBlocks((prev) => {
      pushUndo(prev);
      return prev.filter((b) => b.id !== blockId);
    });
  };

  if (!doc) return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.notFound}>Document not found.</Text>
    </SafeAreaView>
  );

  const halfW = width / 2;

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen
        options={{
          title: 'Edit — ' + doc.title,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 12, marginRight: 8 }}>
              <TouchableOpacity onPress={undo}><Text style={styles.navBtn}>↩</Text></TouchableOpacity>
              <TouchableOpacity onPress={redo}><Text style={styles.navBtn}>↪</Text></TouchableOpacity>
              {isSaving && <Text style={styles.saving}>Saving…</Text>}
            </View>
          ),
        }}
      />

      <View style={styles.split}>
        {/* Left: source image (non-interactive) */}
        <View style={[styles.sourcePane, { width: halfW }]}>
          {doc.pages[0] && (
            <Image source={{ uri: doc.pages[0].imageUri }} style={{ width: halfW, flex: 1 }} resizeMode="contain" />
          )}
        </View>

        {/* Right: editable blocks */}
        <ScrollView style={[styles.editPane, { width: halfW }]} contentContainerStyle={{ padding: 10, gap: 10 }}>
          {blocks.map((block) => {
            const color = BLOCK_TYPE_COLORS[block.type] ?? COLORS.grey[400];
            return (
              <View key={block.id} style={[styles.editBlock, { borderLeftColor: color }]}>
                {/* Type relabel */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                  {BLOCK_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => relabelBlock(block.id, t)}
                      style={[styles.typeTag, block.type === t && { backgroundColor: color + '33', borderColor: color }]}
                    >
                      <Text style={[styles.typeTagText, block.type === t && { color }]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Editable text */}
                <TextInput
                  style={[styles.contentInput, block.isRtl && styles.rtl]}
                  multiline
                  value={block.content}
                  onChangeText={(text) => updateBlockContent(block.id, text)}
                  accessibilityLabel={`Edit ${block.type} block`}
                />

                <TouchableOpacity
                  onPress={() => Alert.alert('Delete block?', '', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteBlock(block.id) },
                  ])}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>🗑 Delete</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  split: { flex: 1, flexDirection: 'row' },
  sourcePane: { backgroundColor: COLORS.grey[900] },
  editPane: { backgroundColor: COLORS.surface },
  navBtn: { fontSize: 18, color: COLORS.primary },
  saving: { fontSize: 11, color: COLORS.grey[400], alignSelf: 'center' },
  editBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderLeftWidth: 3,
    padding: 10,
    gap: 8,
  },
  typeScroll: { flexGrow: 0 },
  typeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: COLORS.grey[200], marginRight: 4 },
  typeTagText: { fontSize: 9, color: COLORS.grey[500] },
  contentInput: { fontSize: 13, color: COLORS.grey[800], lineHeight: 18, minHeight: 40 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  deleteBtn: { alignSelf: 'flex-end' },
  deleteBtnText: { fontSize: 11, color: COLORS.error },
  notFound: { textAlign: 'center', marginTop: 80, fontSize: 16, color: COLORS.grey[500] },
});
