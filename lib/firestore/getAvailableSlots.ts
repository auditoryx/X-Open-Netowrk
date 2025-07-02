import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { firestore } from "../firebase/init";
import { BookingSlot } from "../types/BookingSlot";
import { userHasAccessToSlot } from "../utils/userHasAccessToSlot";

interface User {
  uid: string;
  rank?: 'verified' | 'signature' | 'top5';
  email?: string;
}

/**
 * Get all available booking slots, filtered by user access permissions
 * 
 * @param providerUid - The provider's user ID to get slots for
 * @param currentUser - The current user (for access control)
 * @param startDate - Optional start date to filter slots
 * @param endDate - Optional end date to filter slots
 * @returns Array of available booking slots
 */
export async function getAvailableSlots(
  providerUid: string, 
  currentUser: User | null,
  startDate?: Date,
  endDate?: Date
): Promise<BookingSlot[]> {
  try {
    // Base query - get available slots for the provider
    let queryConstraints = [
      where("providerUid", "==", providerUid),
      where("status", "==", "available"),
      orderBy("scheduledAt", "asc")
    ];
    
    // Add date range filters if provided
    if (startDate) {
      const startTimestamp = Timestamp.fromDate(startDate);
      queryConstraints.push(where("scheduledAt", ">=", startTimestamp));
    }
    
    if (endDate) {
      const endTimestamp = Timestamp.fromDate(endDate);
      queryConstraints.push(where("scheduledAt", "<=", endTimestamp));
    }
    
    // Execute query
    const q = query(collection(firestore, "bookingSlots"), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    // Convert and filter slots
    const slots: BookingSlot[] = [];
    querySnapshot.forEach((doc) => {
      const slotData = { id: doc.id, ...doc.data() } as BookingSlot;
      
      // Apply access control filter
      // Only include slots that are either:
      // 1. Not invite-only, or
      // 2. The user has access to them
      const hasAccess = !slotData.inviteOnly || 
                       (currentUser && userHasAccessToSlot(slotData, currentUser));
      
      if (hasAccess) {
        slots.push(slotData);
      }
    });
    
    return slots;
    
  } catch (error) {
    console.error("Error fetching available slots:", error);
    throw error;
  }
}

/**
 * Get all booking slots for a provider, including those that are invite-only
 * For admin/provider use only
 * 
 * @param providerUid - The provider's user ID
 * @returns All booking slots created by the provider
 */
export async function getAllProviderSlots(providerUid: string): Promise<BookingSlot[]> {
  try {
    const q = query(
      collection(firestore, "bookingSlots"),
      where("providerUid", "==", providerUid),
      orderBy("scheduledAt", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    
    const slots: BookingSlot[] = [];
    querySnapshot.forEach((doc) => {
      slots.push({ id: doc.id, ...doc.data() } as BookingSlot);
    });
    
    return slots;
    
  } catch (error) {
    console.error("Error fetching provider slots:", error);
    throw error;
  }
}
