import { ExtractedBlock, OutputFormat } from './block.types';

export interface SarvamApiConfig {
  apiKey: string;
  baseUrl: string;
}

export interface ExtractDocumentParams {
  images: string[];
  language?: string;
  outputFormat: OutputFormat;
  instructions?: string;
  pageRange?: [number, number];
}

export interface ExtractDocumentResponse {
  jobId: string;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ExtractionResult {
  blocks: ExtractedBlock[];
  pageCount: number;
  languages: string[];
  outputHtml?: string;
  outputJson?: object;
  outputMarkdown?: string;
}

export interface JobStatusResponse {
  status: JobStatus;
  progress: number;
  result?: ExtractionResult;
  error?: string;
}

export interface AgentCorrectionParams {
  documentId: string;
  instruction: string;
  scope: 'full' | `page:${number}` | `type:${string}`;
}

export interface AgentCorrectionResponse {
  jobId: string;
  affectedBlockIds: string[];
}

export interface ProcessingJob {
  jobId: string;
  documentId: string;
  status: JobStatus;
  progress: number;
  step: number;
  startedAt: string;
}
