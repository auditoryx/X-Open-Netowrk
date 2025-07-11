// Test file to verify ESLint rule prevents hardcoded schema fields

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// This should trigger the ESLint rule
async function updateUserBad(userId: string, name: string) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { 
    'name': name,  // This should be flagged by ESLint
    'updatedAt': new Date().toISOString()  // This should be flagged by ESLint
  });
}

// This should NOT trigger the ESLint rule (using constants)
import { SCHEMA_FIELDS } from '@/lib/@schema.d.ts';

async function updateUserGood(userId: string, name: string) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { 
    [SCHEMA_FIELDS.USER.NAME]: name,
    [SCHEMA_FIELDS.USER.UPDATED_AT]: new Date().toISOString()
  });
}

// Test Firestore query with hardcoded field (should be flagged)
import { collection, query, where } from 'firebase/firestore';

async function queryUsersBad() {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'admin')  // This should be flagged by ESLint
  );
  return q;
}

// Test Firestore query with constants (should NOT be flagged)
async function queryUsersGood() {
  const q = query(
    collection(db, 'users'),
    where(SCHEMA_FIELDS.USER.ROLE, '==', 'admin')
  );
  return q;
}

export { updateUserBad, updateUserGood, queryUsersBad, queryUsersGood };