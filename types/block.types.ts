export enum BlockType {
  HEADER = 'HEADER',
  HEADLINE = 'HEADLINE',
  PARAGRAPH = 'PARAGRAPH',
  TABLE = 'TABLE',
  FOOTNOTE = 'FOOTNOTE',
  IMAGE = 'IMAGE',
  AD = 'AD',
  SECTION_TITLE = 'SECTION_TITLE',
  PAGE_NO = 'PAGE_NO',
  SUB_HEADLINE = 'SUB_HEADLINE',
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedBlock {
  id: string;
  type: BlockType;
  content: string;
  bbox: BoundingBox;
  confidence: number;
  pageIndex: number;
  language: string;
  imageCaption?: string;
  tableData?: string[][];
  isRtl?: boolean;
}

export type DocumentStatus = 'processing' | 'done' | 'error';
export type OutputFormat = 'html' | 'json' | 'markdown';

export interface DocumentPage {
  index: number;
  imageUri: string;
  width: number;
  height: number;
}

export interface AksharDocument {
  id: string;
  title: string;
  pages: DocumentPage[];
  blocks: ExtractedBlock[];
  outputFormat: OutputFormat;
  createdAt: string;
  status: DocumentStatus;
  languages: string[];
  outputHtml?: string;
  outputJson?: object;
  outputMarkdown?: string;
  jobId?: string;
  errorMessage?: string;
}
