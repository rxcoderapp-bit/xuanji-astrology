/**
 * 玄機天象 - Google 帳號認證與雲端命例同步服務
 * 基於 Google Firebase (Modular v10+)
 * 支援 Offline-First：離線本機可用，連線時自動雙向智能合併
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  type Firestore
} from 'firebase/firestore';
import type { CaseRecord } from '../types';
import { getStoredCases } from './caseStorage';
import { getDivinationRecords } from './divinationStorage';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

// 預設共用 Firebase 設定（延續 AnesPilot 架構，即開即用）
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyCfqiHXlkg8LL9MUf9uEZYCP_jaXLQl8jc",
  authDomain: "anes-pilot.firebaseapp.com",
  projectId: "anes-pilot",
  storageBucket: "anes-pilot.firebasestorage.app",
  messagingSenderId: "713624096054",
  appId: "1:713624096054:web:47358fbb4835b7558d7797",
  measurementId: "G-CKQGY29D97"
};

const CASES_STORAGE_KEY = 'tianshu_mingli_cases_v1';
const DIVINATION_STORAGE_KEY = 'tianshu_divination_history_v1';
const FIREBASE_CONFIG_KEY = 'tianshu_firebase_config';
const LAST_SYNC_KEY = 'tianshu_last_sync_time';

export type SyncStatus = 'offline' | 'connected' | 'syncing' | 'error';

class CloudSyncService {
  private app: FirebaseApp | null = null;
  public auth: Auth | null = null;
  public db: Firestore | null = null;
  public currentUser: User | null = null;
  public syncStatus: SyncStatus = 'offline';
  public lastSyncTime: string | null = null;

  private authListeners: Array<(user: User | null) => void> = [];
  private syncListeners: Array<(status: SyncStatus, lastTime: string | null) => void> = [];

  constructor() {
    try {
      this.lastSyncTime = localStorage.getItem(LAST_SYNC_KEY) || null;
    } catch {}
  }

  public getConfig(): FirebaseConfig {
    try {
      const custom = localStorage.getItem(FIREBASE_CONFIG_KEY);
      if (custom) {
        return JSON.parse(custom);
      }
    } catch {}
    return DEFAULT_FIREBASE_CONFIG;
  }

  public saveConfig(config: FirebaseConfig): boolean {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
    this.app = null;
    this.auth = null;
    this.db = null;
    return this.init();
  }

  public resetConfig(): boolean {
    localStorage.removeItem(FIREBASE_CONFIG_KEY);
    this.app = null;
    this.auth = null;
    this.db = null;
    return this.init();
  }

  public init(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const config = this.getConfig();
      if (!config.apiKey || !config.projectId) {
        this.setSyncStatus('offline');
        return false;
      }

      this.app = initializeApp(config, 'xuanji-app-' + Date.now());
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);

      onAuthStateChanged(this.auth, async (user) => {
        this.currentUser = user;
        if (user) {
          this.setSyncStatus('connected');
          this.notifyAuthListeners(user);
          // Auto sync on login
          await this.pullAndMerge();
        } else {
          this.setSyncStatus('offline');
          this.notifyAuthListeners(null);
        }
      });

      return true;
    } catch (err) {
      console.warn('[CloudSync] Firebase initialization in local mode:', err);
      this.setSyncStatus('offline');
      return false;
    }
  }

  public async loginWithGoogle(): Promise<User> {
    if (!this.auth) {
      this.init();
      if (!this.auth) {
        throw new Error('Firebase 認證模組尚未就緒，請檢查網路連線或金鑰設定。');
      }
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      this.setSyncStatus('syncing');
      const result = await signInWithPopup(this.auth, provider);
      this.currentUser = result.user;
      this.setSyncStatus('connected');
      this.notifyAuthListeners(this.currentUser);
      await this.pullAndMerge();
      return result.user;
    } catch (error: any) {
      this.setSyncStatus('error');
      console.error('[CloudSync] Google Login Error:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    if (this.auth) {
      await signOut(this.auth);
    }
    this.currentUser = null;
    this.setSyncStatus('offline');
    this.notifyAuthListeners(null);
  }

  /**
   * 雙向智能合併：拉取雲端並合併本機資料，再推回最新狀態
   */
  public async pullAndMerge(): Promise<{ cases: CaseRecord[]; success: boolean } | null> {
    if (!this.currentUser || !this.db) return null;

    try {
      this.setSyncStatus('syncing');
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      const snapshot = await getDoc(userRef);

      const localCases = getStoredCases();
      const localDivinations = getDivinationRecords();

      let mergedCases: CaseRecord[] = [];
      let mergedDivinations = localDivinations;

      if (snapshot.exists()) {
        const cloudData = snapshot.data();
        const cloudCases: CaseRecord[] = Array.isArray(cloudData.xuanjiCases) ? cloudData.xuanjiCases : [];
        const cloudDivinations = Array.isArray(cloudData.xuanjiDivinations) ? cloudData.xuanjiDivinations : [];

        // 智能合併命例：以 id 為鍵，本機與雲端最新記錄優先
        const caseMap = new Map<string, CaseRecord>();
        cloudCases.forEach((c) => {
          if (c && c.id) caseMap.set(c.id, c);
        });
        localCases.forEach((c) => {
          if (c && c.id) caseMap.set(c.id, c); // 本機覆蓋或補入
        });

        mergedCases = Array.from(caseMap.values());

        // 合併占卜紀錄
        const divMap = new Map<string, any>();
        cloudDivinations.forEach((d: any) => {
          if (d && d.id) divMap.set(d.id, d);
        });
        localDivinations.forEach((d) => {
          if (d && d.id) divMap.set(d.id, d);
        });
        mergedDivinations = Array.from(divMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // 寫入本機 LocalStorage
        localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(mergedCases));
        localStorage.setItem(DIVINATION_STORAGE_KEY, JSON.stringify(mergedDivinations));

        // 推送回雲端 Firestore
        await setDoc(
          userRef,
          {
            email: this.currentUser.email,
            displayName: this.currentUser.displayName,
            photoURL: this.currentUser.photoURL,
            xuanjiCases: mergedCases,
            xuanjiDivinations: mergedDivinations,
            lastSyncAt: new Date().toISOString()
          },
          { merge: true }
        );
      } else {
        // 初次同步：將本機全數上傳
        mergedCases = localCases;
        await setDoc(
          userRef,
          {
            email: this.currentUser.email,
            displayName: this.currentUser.displayName,
            photoURL: this.currentUser.photoURL,
            xuanjiCases: localCases,
            xuanjiDivinations: localDivinations,
            lastSyncAt: new Date().toISOString()
          },
          { merge: true }
        );
      }

      this.updateSyncTime();
      this.setSyncStatus('connected');
      return { cases: mergedCases, success: true };
    } catch (e) {
      console.error('[CloudSync] Pull and merge error:', e);
      this.setSyncStatus('error');
      return null;
    }
  }

  /**
   * 當本機有新增/刪修命例時，異步推送至雲端
   */
  public async pushCases(cases: CaseRecord[]): Promise<void> {
    if (!this.currentUser || !this.db) return;

    try {
      this.setSyncStatus('syncing');
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      await setDoc(
        userRef,
        {
          xuanjiCases: cases,
          lastSyncAt: new Date().toISOString()
        },
        { merge: true }
      );
      this.updateSyncTime();
      this.setSyncStatus('connected');
    } catch (e) {
      console.warn('[CloudSync] pushCases error:', e);
      this.setSyncStatus('error');
    }
  }

  private updateSyncTime() {
    const now = new Date();
    this.lastSyncTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    try {
      localStorage.setItem(LAST_SYNC_KEY, this.lastSyncTime);
    } catch {}
  }

  private setSyncStatus(status: SyncStatus) {
    this.syncStatus = status;
    this.syncListeners.forEach((fn) => fn(status, this.lastSyncTime));
  }

  public onAuthChange(callback: (user: User | null) => void): () => void {
    this.authListeners.push(callback);
    callback(this.currentUser);
    return () => {
      const idx = this.authListeners.indexOf(callback);
      if (idx >= 0) this.authListeners.splice(idx, 1);
    };
  }

  public onSyncChange(callback: (status: SyncStatus, lastTime: string | null) => void): () => void {
    this.syncListeners.push(callback);
    callback(this.syncStatus, this.lastSyncTime);
    return () => {
      const idx = this.syncListeners.indexOf(callback);
      if (idx >= 0) this.syncListeners.splice(idx, 1);
    };
  }

  private notifyAuthListeners(user: User | null) {
    this.authListeners.forEach((fn) => fn(user));
  }
}

export const cloudSync = new CloudSyncService();
