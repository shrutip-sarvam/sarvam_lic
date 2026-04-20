import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type VisitType =
  | 'New Proposal'
  | 'Premium Collection'
  | 'Claim Survey'
  | 'Policy Revival'
  | 'Maturity Collection'
  | 'Death Claim'
  | 'Other';

export type JobStatus = 'Pending' | 'In Progress' | 'Done';

export interface Job {
  id: string;
  visitType: VisitType;
  policyNumber: string;
  holderName: string;
  sumAssured: string;
  agentCode: string;
  branch: string;
  notes: string;
  docTitle: string;
  handwritten: boolean;
  photoUris: string[];
  rawExtractedText: string;
  status: JobStatus;
  createdAt: string;
}

export interface ExtractedData {
  policyNumber: string;
  holderName: string;
  sumAssured: string;
  rawText: string;
}

interface JobsState {
  jobs: Job[];
  draftPhotoUris: string[];
  draftExtracted: ExtractedData | null;
  draftDocTitle: string;
  draftHandwritten: boolean;

  setDraftPhotos: (uris: string[]) => void;
  setDraftExtracted: (data: ExtractedData) => void;
  setDraftMeta: (docTitle: string, handwritten: boolean) => void;
  clearDraft: () => void;

  addJob: (data: Omit<Job, 'id' | 'createdAt' | 'status'>) => string;
  updateStatus: (id: string, status: JobStatus) => void;
  deleteJob: (id: string) => void;
}

export const useJobsStore = create<JobsState>()(
  persist(
    (set) => ({
      jobs: [],
      draftPhotoUris: [],
      draftExtracted: null,
      draftDocTitle: '',
      draftHandwritten: false,

      setDraftPhotos: (uris) => set({ draftPhotoUris: uris }),
      setDraftExtracted: (data) => set({ draftExtracted: data }),
      setDraftMeta: (docTitle, handwritten) => set({ draftDocTitle: docTitle, draftHandwritten: handwritten }),
      clearDraft: () => set({ draftPhotoUris: [], draftExtracted: null, draftDocTitle: '', draftHandwritten: false }),

      addJob: (data) => {
        const id = Date.now().toString();
        set((s) => ({
          jobs: [
            { ...data, id, createdAt: new Date().toISOString(), status: 'Pending' },
            ...s.jobs,
          ],
        }));
        return id;
      },

      updateStatus: (id, status) =>
        set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, status } : j)) })),

      deleteJob: (id) => set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),
    }),
    {
      name: 'lic-jobs-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ jobs: s.jobs }),
    }
  )
);
