import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AksharDocument } from '../types/block.types';
import { ProcessingJob } from '../types/api.types';

const MAX_DOCUMENTS = 20;

interface DocumentsState {
  documents: AksharDocument[];
  currentDocument: AksharDocument | null;
  processingJobs: Record<string, ProcessingJob>;
  addDocument: (doc: AksharDocument) => void;
  updateDocument: (id: string, updates: Partial<AksharDocument>) => void;
  deleteDocument: (id: string) => void;
  setCurrentDocument: (doc: AksharDocument | null) => void;
  updateProcessingJob: (jobId: string, update: Partial<ProcessingJob>) => void;
  clearProcessingJob: (jobId: string) => void;
}

export const useDocumentsStore = create<DocumentsState>()(
  persist(
    (set) => ({
      documents: [],
      currentDocument: null,
      processingJobs: {},

      addDocument: (doc) =>
        set((state) => {
          const updated = [doc, ...state.documents].slice(0, MAX_DOCUMENTS);
          return { documents: updated };
        }),

      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
          currentDocument:
            state.currentDocument?.id === id
              ? { ...state.currentDocument, ...updates }
              : state.currentDocument,
        })),

      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
        })),

      setCurrentDocument: (doc) => set({ currentDocument: doc }),

      updateProcessingJob: (jobId, update) =>
        set((state) => ({
          processingJobs: {
            ...state.processingJobs,
            [jobId]: { ...(state.processingJobs[jobId] ?? {}), ...update } as ProcessingJob,
          },
        })),

      clearProcessingJob: (jobId) =>
        set((state) => {
          const { [jobId]: _, ...rest } = state.processingJobs;
          return { processingJobs: rest };
        }),
    }),
    {
      name: 'akshar-documents',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ documents: state.documents }),
    }
  )
);
