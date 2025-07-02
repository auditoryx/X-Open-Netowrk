import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface UserReport {
  reportedUid: string;
  reporterUid: string;
  message: string;
  createdAt: any;
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  category?: string;
}

/**
 * Submit a user report to Firestore
 * @param reportData - The report data to submit
 * @returns Promise<string> - The document ID of the created report
 */
export async function submitUserReport(reportData: {
  reportedUid: string;
  reporterUid: string;
  message: string;
  category?: string;
}): Promise<string> {
  try {
    if (!reportData.reportedUid || !reportData.reporterUid || !reportData.message.trim()) {
      throw new Error('Missing required report data');
    }

    if (reportData.reportedUid === reportData.reporterUid) {
      throw new Error('Cannot report yourself');
    }

    const reportDoc = {
      reportedUid: reportData.reportedUid,
      reporterUid: reportData.reporterUid,
      message: reportData.message.trim(),
      category: reportData.category || 'other',
      status: 'pending' as const,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'reports'), reportDoc);
    console.log('User report submitted:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error submitting user report:', error);
    throw error;
  }
}
