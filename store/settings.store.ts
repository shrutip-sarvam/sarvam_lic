import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OutputFormat } from '../types/block.types';

interface SettingsState {
  outputFormat: OutputFormat;
  defaultLanguage: string;
  defaultInstructions: string;
  hasSeenOnboarding: boolean;
  hasSeenGroundingHint: boolean;
  setOutputFormat: (format: OutputFormat) => void;
  setDefaultLanguage: (lang: string) => void;
  setDefaultInstructions: (text: string) => void;
  markOnboardingSeen: () => void;
  markGroundingHintSeen: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      outputFormat: 'html',
      defaultLanguage: 'auto',
      defaultInstructions: '',
      hasSeenOnboarding: false,
      hasSeenGroundingHint: false,

      setOutputFormat: (format) => set({ outputFormat: format }),
      setDefaultLanguage: (lang) => set({ defaultLanguage: lang }),
      setDefaultInstructions: (text) => set({ defaultInstructions: text }),
      markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
      markGroundingHintSeen: () => set({ hasSeenGroundingHint: true }),
    }),
    {
      name: 'akshar-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
