import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { extractDocument, pollJobStatus } from '../services/sarvam.api';
import { preprocessImage } from '../services/image.processor';
import { useDocumentsStore } from '../store/documents.store';
import { useSettingsStore } from '../store/settings.store';
import { AksharDocument, OutputFormat } from '../types/block.types';
import { ExtractionResult } from '../types/api.types';
function uuidv4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export type ProcessingStep = 1 | 2 | 3 | 4;

interface ProcessorState {
  step: ProcessingStep;
  stepLabel: string;
  progress: number;
  blockCounts: Record<string, number>;
}

const STEP_LABELS: Record<ProcessingStep, string> = {
  1: 'Extracting text and layout',
  2: 'Detecting structure',
  3: 'Applying corrections',
  4: 'Preparing output',
};

export function useDocumentProcessor() {
  const { addDocument, updateDocument, updateProcessingJob } = useDocumentsStore();
  const { outputFormat, defaultLanguage, defaultInstructions } = useSettingsStore();
  const [processorState, setProcessorState] = useState<ProcessorState | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const updateStep = useCallback((step: ProcessingStep, progress: number, extra?: Partial<ProcessorState>) => {
    setProcessorState({ step, stepLabel: STEP_LABELS[step], progress, blockCounts: {}, ...extra });
  }, []);

  const mutation = useMutation({
    mutationFn: async ({
      imageUris,
      title,
      language,
      format,
      instructions,
    }: {
      imageUris: string[];
      title: string;
      language?: string;
      format?: OutputFormat;
      instructions?: string;
    }) => {
      abortRef.current = new AbortController();
      updateStep(1, 0);

      // Pre-process all images
      const processedImages = await Promise.all(
        imageUris.map((uri) => preprocessImage(uri))
      );
      const base64Images = processedImages.map((img) => img.base64);

      // Create a placeholder document
      const docId = uuidv4();
      const doc: AksharDocument = {
        id: docId,
        title,
        pages: processedImages.map((img, i) => ({
          index: i,
          imageUri: img.uri,
          width: img.width,
          height: img.height,
        })),
        blocks: [],
        outputFormat: format ?? outputFormat,
        createdAt: new Date().toISOString(),
        status: 'processing',
        languages: [],
      };
      addDocument(doc);

      updateStep(1, 20);

      const { jobId } = await extractDocument({
        images: base64Images,
        language: language ?? (defaultLanguage === 'auto' ? undefined : defaultLanguage),
        outputFormat: format ?? outputFormat,
        instructions: (instructions ?? defaultInstructions) || undefined,
      });

      updateDocument(docId, { jobId });
      updateProcessingJob(jobId, {
        jobId,
        documentId: docId,
        status: 'processing',
        progress: 20,
        step: 1,
        startedAt: new Date().toISOString(),
      });

      updateStep(2, 30);

      const finalStatus = await pollJobStatus(
        jobId,
        (progress, status) => {
          const mappedStep: ProcessingStep =
            progress < 40 ? 1 : progress < 65 ? 2 : progress < 85 ? 3 : 4;
          updateStep(mappedStep, progress);
          updateProcessingJob(jobId, { progress, status: status as 'processing' | 'completed' | 'failed' });
        },
        abortRef.current.signal
      );

      updateStep(4, 100);

      if (finalStatus.status === 'failed') {
        updateDocument(docId, { status: 'error', errorMessage: finalStatus.error });
        throw new Error(finalStatus.error ?? 'Extraction failed');
      }

      const result = finalStatus.result as ExtractionResult;
      updateDocument(docId, {
        status: 'done',
        blocks: result.blocks,
        languages: result.languages,
        outputHtml: result.outputHtml,
        outputJson: result.outputJson,
        outputMarkdown: result.outputMarkdown,
      });

      return { docId, result };
    },
    onSettled: () => setProcessorState(null),
  });

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setProcessorState(null);
    mutation.reset();
  }, [mutation]);

  return {
    processDocument: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    processorState,
    cancel,
  };
}
