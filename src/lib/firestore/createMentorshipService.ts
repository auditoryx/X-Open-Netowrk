import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, getDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Mentorship, MentorshipService, MentorProfile } from '@/lib/types/Mentorship';
import { SCHEMA_FIELDS } from '../SCHEMA_FIELDS';

export async function createMentorshipService(
  mentorId: string,
  serviceData: Omit<MentorshipService, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'completedSessions'>
): Promise<string> {
  try {
    const mentorshipService: Omit<MentorshipService, 'id'> = {
      ...serviceData,
      mentorId,
      rating: 0,
      reviewCount: 0,
      completedSessions: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'mentorshipServices'), mentorshipService);
    return docRef.id;
  } catch (error) {
    console.error('Error creating mentorship service:', error);
    throw new Error('Failed to create mentorship service');
  }
}

export async function getMentorshipService(serviceId: string): Promise<MentorshipService | null> {
  try {
    const docRef = doc(db, 'mentorshipServices', serviceId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as MentorshipService;
    }
    return null;
  } catch (error) {
    console.error('Error getting mentorship service:', error);
    return null;
  }
}

export async function updateMentorshipService(
  serviceId: string,
  updates: Partial<MentorshipService>
): Promise<void> {
  try {
    const docRef = doc(db, 'mentorshipServices', serviceId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating mentorship service:', error);
    throw new Error('Failed to update mentorship service');
  }
}

export async function getMentorshipServicesByMentor(mentorId: string): Promise<MentorshipService[]> {
  try {
    const q = query(
      collection(db, 'mentorshipServices'),
      where('mentorId', '==', mentorId),
      where(SCHEMA_FIELDS.SERVICE.IS_ACTIVE, '==', true),
      orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MentorshipService[];
  } catch (error) {
    console.error('Error getting mentorship services:', error);
    return [];
  }
}

export async function getMentorshipServicesByCategory(category: string): Promise<MentorshipService[]> {
  try {
    const q = query(
      collection(db, 'mentorshipServices'),
      where(SCHEMA_FIELDS.SERVICE.CATEGORY, '==', category),
      where(SCHEMA_FIELDS.SERVICE.IS_ACTIVE, '==', true),
      orderBy(SCHEMA_FIELDS.REVIEW.RATING, 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MentorshipService[];
  } catch (error) {
    console.error('Error getting mentorship services by category:', error);
    return [];
  }
}

export async function searchMentorshipServices(searchTerm: string): Promise<MentorshipService[]> {
  try {
    // This is a simplified search - in production, you'd use a proper search service
    const q = query(
      collection(db, 'mentorshipServices'),
      where(SCHEMA_FIELDS.SERVICE.IS_ACTIVE, '==', true),
      orderBy(SCHEMA_FIELDS.REVIEW.RATING, 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const services = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MentorshipService[];
    
    // Filter based on search term
    return services.filter(service => 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  } catch (error) {
    console.error('Error searching mentorship services:', error);
    return [];
  }
}

export async function createMentorship(
  mentorId: string,
  menteeId: string,
  serviceId: string,
  mentorshipData: Omit<Mentorship, 'id' | 'createdAt' | 'updatedAt' | 'sessions' | 'completedSessions'>
): Promise<string> {
  try {
    const mentorship: Omit<Mentorship, 'id'> = {
      ...mentorshipData,
      mentorId,
      menteeId,
      sessions: [],
      completedSessions: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'mentorships'), mentorship);
    return docRef.id;
  } catch (error) {
    console.error('Error creating mentorship:', error);
    throw new Error('Failed to create mentorship');
  }
}

export async function getMentorship(mentorshipId: string): Promise<Mentorship | null> {
  try {
    const docRef = doc(db, 'mentorships', mentorshipId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Mentorship;
    }
    return null;
  } catch (error) {
    console.error('Error getting mentorship:', error);
    return null;
  }
}

export async function updateMentorship(
  mentorshipId: string,
  updates: Partial<Mentorship>
): Promise<void> {
  try {
    const docRef = doc(db, 'mentorships', mentorshipId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating mentorship:', error);
    throw new Error('Failed to update mentorship');
  }
}

// Re-export needed Firestore functions
export { getDoc, doc } from 'firebase/firestore';

/**
 * Toggle mentorship active status
 */
export async function toggleMentorshipActive(mentorshipId: string, isActive: boolean): Promise<void> {
  try {
    const mentorshipRef = doc(db, 'mentorshipServices', mentorshipId);
    await updateDoc(mentorshipRef, {
      isActive,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error toggling mentorship status:', error);
    throw error;
  }
}

/**
 * Check if a user is the creator of a mentorship
 * @param mentorshipId - The mentorship ID
 * @param userId - The user ID to check
 * @returns Promise<boolean> - Whether the user is the creator
 */
export async function isCreatorOfMentorship(mentorshipId: string, userId: string): Promise<boolean> {
  try {
    const mentorshipRef = doc(db, 'mentorships', mentorshipId);
    const mentorshipDoc = await getDoc(mentorshipRef);
    
    if (!mentorshipDoc.exists()) {
      return false;
    }
    
    const mentorshipData = mentorshipDoc.data();
    return mentorshipData.mentorId === userId;
  } catch (error) {
    console.error('Error checking mentorship creator:', error);
    return false;
  }
}
