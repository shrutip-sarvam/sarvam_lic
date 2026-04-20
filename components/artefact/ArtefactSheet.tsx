/**
 * ArtefactSheet — slides up from bottom, shows parsed document content
 * Faithful to Figma: rounded-32 card, #f9f8f8 bg, blurred backdrop, scrollable content
 * Top pill: icon + title + 3-dot menu (Copy/Delete/Download) + close X
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Share,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { impact } from '../../utils/haptics';
import type { ParsedDocument, ParsedBlock } from '../../services/vision.api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.92;

interface Props {
  visible: boolean;
  document: ParsedDocument | null;
  loading?: boolean;
  onClose: () => void;
}

export default function ArtefactSheet({ visible, document, loading, onClose }: Props) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [menuVisible, setMenuVisible] = useState(false);

  React.useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 180 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(SHEET_HEIGHT, { duration: 280 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const getRawText = () =>
    document?.blocks
      .map((b) => {
        if (b.type === 'bullet' && b.items) return b.items.map((it) => `• ${it}`).join('\n');
        return b.text;
      })
      .join('\n\n') ?? '';

  const handleCopy = useCallback(async () => {
    await impact("Light");
    setMenuVisible(false);
    await Clipboard.setStringAsync(getRawText());
    Alert.alert('Copied', 'Document text copied to clipboard.');
  }, [document]);

  const handleShare = useCallback(async () => {
    await impact("Light");
    setMenuVisible(false);
    await Share.share({ message: getRawText(), title: document?.title });
  }, [document]);

  const handleDelete = useCallback(() => {
    setMenuVisible(false);
    Alert.alert('Delete Artefact', 'Remove this document from the chat?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onClose },
    ]);
  }, [onClose]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      {/* Blurred backdrop — rgba(0,0,0,0.10) per Figma */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* Top pill bar (matches Figma "Report - Modal" header) */}
        <View style={styles.topBar}>
          {/* Document title pill */}
          <View style={styles.titlePill}>
            <View style={styles.docIconWrap}>
              <Text style={styles.docIcon}>📄</Text>
            </View>
            <Text style={styles.titleText} numberOfLines={1}>
              {document?.title ?? 'Document'}
            </Text>
          </View>

          {/* Right actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setMenuVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="More options"
            >
              <Text style={styles.actionIcon}>⋯</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.actionIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#131313" />
            <Text style={styles.loadingText}>Analysing document…</Text>
            <Text style={styles.loadingSubtext}>Extracting and translating text</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {document?.blocks.map((block) => (
              <BlockView key={block.id} block={block} />
            ))}
            {/* Bottom spacer */}
            <View style={{ height: 80 }} />
          </ScrollView>
        )}

        {/* Overflow menu (Context menu: Copy / Delete / Download) */}
        {menuVisible && (
          <Modal transparent animationType="fade" visible={menuVisible} onRequestClose={() => setMenuVisible(false)}>
            <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)}>
              <View style={styles.contextMenu}>
                <MenuItem icon="⧉" label="Copy text" onPress={handleCopy} />
                <View style={styles.divider} />
                <MenuItem icon="↑" label="Share" onPress={handleShare} />
                <View style={styles.divider} />
                <MenuItem icon="🗑" label="Delete" onPress={handleDelete} destructive />
              </View>
            </Pressable>
          </Modal>
        )}
      </Animated.View>
    </Modal>
  );
}

// ─── Block renderer ────────────────────────────────────────────────────────────

function BlockView({ block }: { block: ParsedBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <Text style={[styles.heading, block.level === 1 ? styles.h1 : block.level === 2 ? styles.h2 : styles.h3]}>
          {block.text}
        </Text>
      );
    case 'subheading':
      return <Text style={styles.subheading}>{block.text}</Text>;
    case 'bullet':
      return (
        <View style={styles.bulletGroup}>
          {(block.items ?? [block.text]).map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case 'code':
      return (
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{block.text}</Text>
        </View>
      );
    case 'paragraph':
    default:
      return <Text style={styles.paragraph}>{block.text}</Text>;
  }
}

function MenuItem({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} accessibilityRole="button">
      <Text style={styles.menuItemIcon}>{icon}</Text>
      <Text style={[styles.menuItemLabel, destructive && styles.menuItemDestructive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#f9f8f8',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: '#ededed',
    shadowColor: '#131313',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 80,
    elevation: 24,
    overflow: 'hidden',
  },
  // Top pill bar — exact Figma: icon + title + actions
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ededed',
    backgroundColor: '#f9f8f8',
  },
  titlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ededed',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    marginRight: 12,
  },
  docIconWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  docIcon: { fontSize: 16 },
  titleText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#131313' },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: { fontSize: 18, color: '#131313', fontWeight: '600' },
  // Scrollable content
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 28, paddingTop: 28 },
  // Block types
  h1: { fontSize: 26, fontWeight: '700', marginBottom: 20 },
  h2: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  h3: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  heading: { color: '#131313', lineHeight: 32 },
  subheading: { fontSize: 20, fontWeight: '600', color: '#131313', marginTop: 24, marginBottom: 10 },
  paragraph: { fontSize: 16, color: '#131313', lineHeight: 24, marginBottom: 16 },
  bulletGroup: { marginBottom: 16 },
  bulletRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  bulletDot: { fontSize: 16, color: '#131313', marginTop: 2 },
  bulletText: { flex: 1, fontSize: 16, color: '#131313', lineHeight: 24 },
  codeBlock: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  codeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, color: '#333' },
  // Loading
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingBottom: 80,
  },
  loadingText: { fontSize: 18, fontWeight: '600', color: '#131313' },
  loadingSubtext: { fontSize: 14, color: '#a5a5a5' },
  // Context menu
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'flex-end', paddingTop: 130, paddingRight: 20 },
  contextMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ededed',
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  menuItemIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  menuItemLabel: { fontSize: 15, color: '#131313', fontWeight: '400' },
  menuItemDestructive: { color: '#e53935' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 8 },
});
