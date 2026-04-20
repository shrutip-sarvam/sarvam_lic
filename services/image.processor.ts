import * as ImageManipulator from 'expo-image-manipulator';

const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;
const MIN_DIMENSION = 500;

export interface ProcessedImage {
  uri: string;
  base64: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface ProcessingOptions {
  deskewAngle?: number;
  cropRegion?: { x: number; y: number; width: number; height: number };
}

export async function preprocessImage(
  uri: string,
  options: ProcessingOptions = {}
): Promise<ProcessedImage> {
  const actions: ImageManipulator.Action[] = [];

  if (options.cropRegion) {
    actions.push({ crop: options.cropRegion });
  }

  if (options.deskewAngle && Math.abs(options.deskewAngle) > 0.5) {
    actions.push({ rotate: -options.deskewAngle });
  }

  actions.push({
    resize: { width: MAX_DIMENSION },
  });

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: JPEG_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });

  if (result.width < MIN_DIMENSION || result.height < MIN_DIMENSION) {
    throw new Error(
      `Image too small (${result.width}×${result.height}). Minimum is ${MIN_DIMENSION}×${MIN_DIMENSION}px.`
    );
  }

  const base64Data = result.base64 ?? '';
  const sizeBytes = Math.round((base64Data.length * 3) / 4);

  return {
    uri: result.uri,
    base64: base64Data,
    width: result.width,
    height: result.height,
    sizeBytes,
  };
}

export function estimateSkewAngle(_uri: string): number {
  // Placeholder: in a production app, run edge-detection heuristics.
  // For now returns 0 so images are passed through unchanged.
  return 0;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
