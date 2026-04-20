import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ClaimType =
  | 'Death Claim'
  | 'Maturity Claim'
  | 'Survival Benefit'
  | 'Disability Claim'
  | 'Surrender Claim';

export type JobStatus = 'Pending' | 'In Progress' | 'Done';

/** Real LIC Claim Form — fields match an actual LIC Form 3783 / A1 claim form */
export interface Job {
  id: string;
  createdAt: string;
  status: JobStatus;

  /* Document meta */
  docTitle: string;
  handwritten: boolean;
  photoUris: string[];
  rawExtractedText: string;

  /* Claim details */
  claimType: ClaimType;
  dateOfEvent: string;        // death / maturity date
  causeOfDeath?: string;

  /* Policy details */
  policyNumber: string;
  holderName: string;         // life assured
  sumAssured: string;
  dateOfCommencement: string;

  /* Claimant (person filing the claim) */
  claimantName: string;
  claimantRelation: string;   // Self / Spouse / Son / Daughter / Nominee etc.
  claimantPhone: string;

  /* Payout */
  bankAccount: string;
  bankIfsc: string;
  bankName: string;

  /* Agent */
  agentCode: string;
  branchCode: string;

  /* Remarks */
  notes: string;
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
  draftLanguage: string;

  setDraftPhotos: (uris: string[]) => void;
  setDraftExtracted: (data: ExtractedData) => void;
  setDraftMeta: (docTitle: string, handwritten: boolean, language?: string) => void;
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
      draftLanguage: 'en-IN',

      setDraftPhotos: (uris) => set({ draftPhotoUris: uris }),
      setDraftExtracted: (data) => set({ draftExtracted: data }),
      setDraftMeta: (docTitle, handwritten, language) =>
        set((s) => ({
          draftDocTitle: docTitle,
          draftHandwritten: handwritten,
          draftLanguage: language ?? s.draftLanguage,
        })),
      clearDraft: () =>
        set({
          draftPhotoUris: [],
          draftExtracted: null,
          draftDocTitle: '',
          draftHandwritten: false,
          draftLanguage: 'en-IN',
        }),

      addJob: (data) => {
        const id = Date.now().toString();
        set((s) => ({
          jobs: [
            { ...data, id, createdAt: new Date().toISOString(), status: 'Pending' as JobStatus },
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
      name: 'lic-jobs-v3',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ jobs: s.jobs }),
    }
  )
);
