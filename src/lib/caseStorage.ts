import type { CaseRecord } from '../types';
import { cloudSync } from './cloudSync';

const STORAGE_KEY = 'xuanji_mingli_cases_v3';

// Purge legacy storage versions if present
try {
  localStorage.removeItem('xuanji_mingli_cases_v1');
  localStorage.removeItem('xuanji_mingli_cases_v2');
} catch {}

// No default preset cases - starts completely clean
const DEFAULT_PRESET_CASES: CaseRecord[] = [];

export function getStoredCases(): CaseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRESET_CASES));
      return DEFAULT_PRESET_CASES;
    }
    const parsed = JSON.parse(raw);
    const list: CaseRecord[] = Array.isArray(parsed) ? parsed : DEFAULT_PRESET_CASES;
    return list;
  } catch (e) {
    console.error('Failed to read cases from localStorage:', e);
    return DEFAULT_PRESET_CASES;
  }
}

export function saveCaseRecord(record: Omit<CaseRecord, 'id' | 'createdAt'>): CaseRecord {
  const current = getStoredCases();
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const newRecord: CaseRecord = {
    ...record,
    id: `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: timeStr
  };

  const updated = [newRecord, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  cloudSync.pushCases(updated);
  return newRecord;
}

export function updateCaseRecord(record: CaseRecord): void {
  const current = getStoredCases();
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const updated = current.map(item => {
    if (item.id === record.id) {
      return { ...record, updatedAt: timeStr };
    }
    return item;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  cloudSync.pushCases(updated);
}

export function deleteCaseRecord(id: string): void {
  const current = getStoredCases();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  cloudSync.pushCases(updated);
}

export function clearAllCases(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  cloudSync.pushCases([]);
}

export function exportCasesToJson(): string {
  const cases = getStoredCases();
  return JSON.stringify(cases, null, 2);
}

export function importCasesFromJson(jsonStr: string): number {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) throw new Error('匯入資料必須為陣列');
    
    const current = getStoredCases();
    const existingIds = new Set(current.map(c => c.id));
    let addedCount = 0;

    const merged = [...current];
    parsed.forEach((item: any) => {
      if (item && item.name && item.year) {
        const id = item.id && !existingIds.has(item.id) ? item.id : `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        existingIds.add(id);
        merged.push({
          ...item,
          id
        });
        addedCount++;
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    cloudSync.pushCases(merged);
    return addedCount;
  } catch (e) {
    console.error('Import failed:', e);
    throw e;
  }
}
