import {
  AgentCorrectionParams,
  AgentCorrectionResponse,
  ExtractDocumentParams,
  ExtractDocumentResponse,
  JobStatusResponse,
} from '../types/api.types';

// Demo build ships without secrets. Point these at a real backend proxy when deploying.
const API_BASE_URL = 'https://api.sarvam.ai';
const API_KEY = '';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;
const MAX_RETRIES = 3;

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    if (retries <= 0) throw err;
    const status = (err as { status?: number }).status;
    if (status === 401) throw err;
    await new Promise((r) => setTimeout(r, delayMs));
    return withRetry(fn, retries - 1, delayMs * 2);
  }
}

async function apiRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: object
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      // TODO: Verify exact header name with Sarvam API docs at https://docs.sarvam.ai
      'api-subscription-key': API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    const error = new Error('Invalid API key. Check your settings.');
    (error as Error & { status: number }).status = 401;
    throw error;
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After') ?? '60';
    const error = new Error(`Rate limit reached. Retrying in ${retryAfter} seconds...`);
    (error as Error & { status: number }).status = 429;
    throw error;
  }

  if (response.status >= 500) {
    const error = new Error('Sarvam servers are busy. Retrying...');
    (error as Error & { status: number }).status = response.status;
    throw error;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

// TODO: Verify exact endpoint path with Sarvam API docs at https://docs.sarvam.ai
export async function extractDocument(
  params: ExtractDocumentParams
): Promise<ExtractDocumentResponse> {
  return withRetry(() =>
    apiRequest<ExtractDocumentResponse>('POST', '/v1/vision/document-extract', {
      images: params.images,
      language: params.language,
      output_format: params.outputFormat,
      instructions: params.instructions,
      page_range: params.pageRange,
    })
  );
}

// TODO: Verify exact endpoint path with Sarvam API docs at https://docs.sarvam.ai
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  return withRetry(() =>
    apiRequest<JobStatusResponse>('GET', `/v1/vision/jobs/${jobId}`)
  );
}

export async function pollJobStatus(
  jobId: string,
  onProgress: (progress: number, status: string) => void,
  signal?: AbortSignal
): Promise<JobStatusResponse> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (signal?.aborted) throw new Error('Polling cancelled.');

    const result = await getJobStatus(jobId);
    onProgress(result.progress, result.status);

    if (result.status === 'completed' || result.status === 'failed') {
      return result;
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error('Document is taking longer than expected. Please try again.');
}

// TODO: Verify exact endpoint path with Sarvam API docs at https://docs.sarvam.ai
export async function applyAgentCorrection(
  params: AgentCorrectionParams
): Promise<AgentCorrectionResponse> {
  return withRetry(() =>
    apiRequest<AgentCorrectionResponse>('POST', '/v1/vision/agent-correct', {
      document_id: params.documentId,
      instruction: params.instruction,
      scope: params.scope,
    })
  );
}
