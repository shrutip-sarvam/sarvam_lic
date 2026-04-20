import { useMutation } from '@tanstack/react-query';
import { extractDocument, pollJobStatus } from '../services/sarvam.api';
import { preprocessImage } from '../services/image.processor';
import { OutputFormat } from '../types/block.types';
import { ExtractionResult } from '../types/api.types';

interface UseSarvamVisionOptions {
  onProgress?: (step: string, percent: number) => void;
  onSuccess?: (result: ExtractionResult & { id: string }) => void;
  onError?: (message: string) => void;
}

export function useSarvamVision(options: UseSarvamVisionOptions = {}) {
  const { onProgress, onSuccess, onError } = options;

  return useMutation({
    mutationFn: async ({
      imageUris,
      outputFormat,
      language,
      instructions,
      documentId,
    }: {
      imageUris: string[];
      outputFormat: OutputFormat;
      language?: string;
      instructions?: string;
      documentId: string;
    }) => {
      onProgress?.('Preprocessing images', 5);

      const processed = await Promise.all(imageUris.map((uri) => preprocessImage(uri)));
      const base64s = processed.map((p) => p.base64);

      onProgress?.('Uploading to Sarvam', 15);

      const { jobId } = await extractDocument({
        images: base64s,
        language,
        outputFormat,
        instructions,
      });

      const finalStatus = await pollJobStatus(jobId, (progress, status) => {
        onProgress?.(status, progress);
      });

      if (finalStatus.status === 'failed') {
        throw new Error(finalStatus.error ?? 'Processing failed');
      }

      return { ...finalStatus.result!, id: documentId };
    },
    onSuccess: (result) => onSuccess?.(result),
    onError: (err: Error) => onError?.(err.message),
  });
}
