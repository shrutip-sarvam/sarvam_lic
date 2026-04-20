import AsyncStorage from '@react-native-async-storage/async-storage';
import { AksharDocument } from '../types/block.types';

const DOCUMENTS_KEY = 'akshar_documents';
const MAX_STORED_DOCUMENTS = 20;

export async function loadDocuments(): Promise<AksharDocument[]> {
  try {
    const raw = await AsyncStorage.getItem(DOCUMENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AksharDocument[];
  } catch {
    return [];
  }
}

export async function saveDocuments(docs: AksharDocument[]): Promise<void> {
  const trimmed = [...docs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_STORED_DOCUMENTS);
  await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(trimmed));
}

export async function clearDocuments(): Promise<void> {
  await AsyncStorage.removeItem(DOCUMENTS_KEY);
}
