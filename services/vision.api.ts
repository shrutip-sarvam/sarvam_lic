/**
 * Sarvam Vision API — document/image parsing and translation
 * Sends an image (camera scan or uploaded file) and returns structured text blocks.
 */

const SARVAM_BASE_URL =
  process.env.EXPO_PUBLIC_SARVAM_API_BASE_URL ?? 'https://api.sarvam.ai';
const SARVAM_API_KEY = process.env.EXPO_PUBLIC_SARVAM_API_KEY ?? '';

export type BlockType = 'heading' | 'subheading' | 'paragraph' | 'bullet' | 'table' | 'code';

export interface ParsedBlock {
  id: string;
  type: BlockType;
  text: string;
  level?: number; // heading level 1-3
  items?: string[]; // for bullet lists
}

export interface ParsedDocument {
  title: string;
  language: string;
  blocks: ParsedBlock[];
  rawText: string;
}

export interface VisionParseResult {
  success: boolean;
  document?: ParsedDocument;
  error?: string;
}

/** Send a base64 image to Sarvam Vision and return parsed document blocks. */
export async function parseDocumentWithVision(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'application/pdf' = 'image/jpeg',
  targetLanguage: string = 'en-IN',
): Promise<VisionParseResult> {
  try {
    const response = await fetch(`${SARVAM_BASE_URL}/v1/vision/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: JSON.stringify({
        image: imageBase64,
        mime_type: mimeType,
        target_language: targetLanguage,
        extract_structure: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: `API error ${response.status}: ${err}` };
    }

    const data = await response.json();

    // Map API response → ParsedDocument
    const document: ParsedDocument = {
      title: data.title ?? 'Scanned Document',
      language: data.detected_language ?? targetLanguage,
      rawText: data.raw_text ?? '',
      blocks: (data.blocks ?? []).map((b: any, i: number) => ({
        id: `block-${i}`,
        type: mapBlockType(b.type),
        text: b.text ?? '',
        level: b.level,
        items: b.items,
      })),
    };

    // If no structured blocks returned, convert raw text
    if (document.blocks.length === 0 && document.rawText) {
      document.blocks = rawTextToBlocks(document.rawText);
    }

    return { success: true, document };
  } catch (error: any) {
    // In dev/no-key mode return mock data so UI can be tested
    if (__DEV__ || !SARVAM_API_KEY) {
      return { success: true, document: mockDocument() };
    }
    return { success: false, error: error.message ?? 'Network error' };
  }
}

/** Translate a raw text string using Sarvam Translate API. */
export async function translateText(
  text: string,
  sourceLanguage: string = 'auto',
  targetLanguage: string = 'en-IN',
): Promise<{ success: boolean; translated?: string; error?: string }> {
  try {
    const response = await fetch(`${SARVAM_BASE_URL}/v1/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: JSON.stringify({
        input: text,
        source_language_code: sourceLanguage,
        target_language_code: targetLanguage,
        speaker_gender: 'Male',
        mode: 'formal',
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Translate error ${response.status}` };
    }

    const data = await response.json();
    return { success: true, translated: data.translated_text };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapBlockType(raw: string): BlockType {
  const map: Record<string, BlockType> = {
    heading: 'heading',
    title: 'heading',
    subheading: 'subheading',
    paragraph: 'paragraph',
    text: 'paragraph',
    bullet: 'bullet',
    list: 'bullet',
    table: 'table',
    code: 'code',
  };
  return map[raw?.toLowerCase()] ?? 'paragraph';
}

/** Convert plain raw text into simple paragraph blocks. */
function rawTextToBlocks(raw: string): ParsedBlock[] {
  return raw
    .split(/\n{2,}/)
    .map((p, i) => p.trim())
    .filter(Boolean)
    .map((text, i) => ({
      id: `block-${i}`,
      type: 'paragraph' as BlockType,
      text,
    }));
}

/** Dev mock — returns a realistic parsed document. */
function mockDocument(): ParsedDocument {
  return {
    title: 'Scanned Document',
    language: 'hi-IN',
    rawText: '',
    blocks: [
      { id: 'b0', type: 'heading', text: 'Scanned Document', level: 1 },
      { id: 'b1', type: 'subheading', text: 'Extracted Content', level: 2 },
      {
        id: 'b2',
        type: 'paragraph',
        text: 'This is the extracted text from your scanned document. The Sarvam Vision API has identified the structure and content of the image.',
      },
      {
        id: 'b3',
        type: 'paragraph',
        text: 'Real-time translation is applied to convert regional language text into the selected output language while preserving the document structure.',
      },
      {
        id: 'b4',
        type: 'subheading',
        text: 'Key Points',
        level: 2,
      },
      {
        id: 'b5',
        type: 'bullet',
        text: '',
        items: [
          'Accurate text extraction from printed and handwritten documents',
          'Multi-language support including Hindi, Tamil, Telugu, Bengali and more',
          'Structure preservation — headings, paragraphs, tables and lists',
        ],
      },
    ],
  };
}
