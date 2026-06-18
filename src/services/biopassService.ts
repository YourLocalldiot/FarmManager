import { db, storage } from '../config/firebase';
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { BioPassRecord } from '../types/biopass';

export const biopassService = {
  createRecord: async (userId: string): Promise<string> => {
    const newRecordRef = doc(collection(db, 'biopass'));
    const initialData: BioPassRecord = {
      id: newRecordRef.id,
      createdAt: new Date().toISOString(),
      status: 'Draft',
    };
    await setDoc(newRecordRef, initialData);
    return newRecordRef.id;
  },

  saveFullRecord: async (recordId: string, data: Partial<BioPassRecord>) => {
    const docRef = doc(db, 'biopass', recordId);
    await updateDoc(docRef, data);
  },

  uploadEvidenceFile: async (file: File, recordId: string): Promise<string> => {
    const storageRef = ref(storage, `biopass/${recordId}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },
  
  uploadSignatureImage: async (dataUrl: string, recordId: string): Promise<string> => {
    // Convert base64 to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const storageRef = ref(storage, `biopass/${recordId}/signature.png`);
    const snapshot = await uploadBytes(storageRef, blob);
    return await getDownloadURL(snapshot.ref);
  }
};
