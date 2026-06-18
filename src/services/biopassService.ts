import { db, storage } from '../config/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import type { BioPassRecord } from '../types/biopass';

// Helper to run a promise with a timeout
const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  const timeout = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
};

export const biopassService = {
  createRecord: async (userId: string): Promise<string> => {
    const newRecordRef = doc(collection(db, 'biopass'));
    const initialData: BioPassRecord = {
      id: newRecordRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Draft',
      userId,
    };
    await withTimeout(setDoc(newRecordRef, initialData), 8000, 'createRecord');
    return newRecordRef.id;
  },

  saveFullRecord: async (recordId: string, data: Partial<BioPassRecord>): Promise<void> => {
    const docRef = doc(db, 'biopass', recordId);
    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await withTimeout(setDoc(docRef, payload, { merge: true }), 8000, 'saveFullRecord');
  },

  // Fire-and-forget version — does not throw, does not block
  saveFullRecordBackground: (recordId: string, data: Partial<BioPassRecord>): void => {
    const docRef = doc(db, 'biopass', recordId);
    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setDoc(docRef, payload, { merge: true }).catch((err) => {
      console.error('[biopassService] Background save failed:', err);
    });
  },

  getRecord: async (recordId: string): Promise<BioPassRecord | null> => {
    const docRef = doc(db, 'biopass', recordId);
    const snap = await withTimeout(getDoc(docRef), 8000, 'getRecord');
    return snap.exists() ? (snap.data() as BioPassRecord) : null;
  },

  getUserRecords: async (userId: string): Promise<BioPassRecord[]> => {
    const q = query(
      collection(db, 'biopass'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snap = await withTimeout(getDocs(q), 8000, 'getUserRecords');
    return snap.docs.map((d) => d.data() as BioPassRecord);
  },

  uploadEvidenceFile: async (file: File, recordId: string): Promise<string> => {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `biopass/${recordId}/${Date.now()}_${sanitizedName}`);
    const snapshot = await withTimeout(
      uploadBytes(storageRef, file),
      30000, // 30s timeout for uploads
      `uploadEvidenceFile(${file.name})`
    );
    return await withTimeout(getDownloadURL(snapshot.ref), 8000, 'getDownloadURL');
  },

  uploadSignatureImage: async (dataUrl: string, recordId: string): Promise<string> => {
    const storageRef = ref(storage, `biopass/${recordId}/signature.png`);
    const snapshot = await withTimeout(
      uploadString(storageRef, dataUrl, 'data_url'),
      15000,
      'uploadSignatureImage'
    );
    return await withTimeout(getDownloadURL(snapshot.ref), 8000, 'getSignatureDownloadURL');
  },
};
