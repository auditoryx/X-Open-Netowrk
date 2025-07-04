import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { CollabPackage, CollabPackageCreator } from '@/src/lib/types/CollabPackage';
import { getUserProfile } from '@/lib/firestore/getUserProfile';

export interface CreateCollabPackageData {
  title: string;
  description: string;
  roles: {
    artistUid?: string;
    producerUid?: string;
    engineerUid?: string;
    videographerUid?: string;
    studioUid?: string;
  };
  totalPrice: number;
  priceBreakdown?: {
    artist?: number;
    producer?: number;
    engineer?: number;
    videographer?: number;
    studio?: number;
  };
  durationMinutes: number;
  tags: string[];
  media?: string[];
  availableLocations?: string[];
  equipment?: string[];
  genre?: string[];
  packageType: CollabPackage['packageType'];
  isPublic?: boolean;
}

/**
 * Create a new collaboration package
 */
export async function createCollabPackage(
  packageData: CreateCollabPackageData,
  createdBy: string
): Promise<string> {
  try {
    if (!createdBy) {
      throw new Error('Creator UID is required');
    }

    // Validate that at least one role is assigned
    const hasMembers = Object.values(packageData.roles).some(uid => uid);
    if (!hasMembers) {
      throw new Error('At least one team member must be assigned');
    }

    // Validate that the creator is part of the package
    const creatorInPackage = Object.values(packageData.roles).includes(createdBy);
    if (!creatorInPackage) {
      throw new Error('Package creator must be assigned to one of the roles');
    }

    // Fetch role details for all members
    const roleDetails: CollabPackage['roleDetails'] = {};
    const memberUids: string[] = [];

    for (const [role, uid] of Object.entries(packageData.roles)) {
      if (uid) {
        try {
          const userProfile = await getUserProfile(uid);
          if (userProfile) {
            roleDetails[role as keyof typeof roleDetails] = {
              name: userProfile.name || userProfile.displayName || 'Unknown',
              profileImage: userProfile.profileImage,
              verified: userProfile.verified || false
            };
            memberUids.push(uid);
          }
        } catch (error) {
          console.warn(`Failed to fetch profile for ${role} (${uid}):`, error);
          // Continue with other members even if one fails
        }
      }
    }

    // Validate price breakdown matches total (if provided)
    if (packageData.priceBreakdown) {
      const breakdownTotal = Object.values(packageData.priceBreakdown)
        .reduce((sum, amount) => sum + (amount || 0), 0);
      
      if (Math.abs(breakdownTotal - packageData.totalPrice) > 0.01) {
        throw new Error('Price breakdown does not match total price');
      }
    }

    // Create the collaboration package
    const collabPackage: Omit<CollabPackage, 'id'> = {
      title: packageData.title.trim(),
      description: packageData.description.trim(),
      roles: packageData.roles,
      roleDetails,
      totalPrice: packageData.totalPrice,
      priceBreakdown: packageData.priceBreakdown,
      durationMinutes: packageData.durationMinutes,
      tags: packageData.tags.map(tag => tag.trim().toLowerCase()),
      media: packageData.media || [],
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      availableLocations: packageData.availableLocations || [],
      equipment: packageData.equipment || [],
      genre: packageData.genre || [],
      packageType: packageData.packageType,
      status: 'active',
      isPublic: packageData.isPublic !== false, // Default to true
      featured: false,
      viewCount: 0,
      bookingCount: 0,
      reviewCount: 0
    };

    // Save to Firestore
    const collabPackagesRef = collection(db, 'collabPackages');
    const docRef = await addDoc(collabPackagesRef, collabPackage);

    console.log('Collaboration package created:', docRef.id);

    // Send notifications to all package members (except creator)
    await sendPackageCreationNotifications(docRef.id, collabPackage, createdBy);

    return docRef.id;

  } catch (error) {
    console.error('Error creating collaboration package:', error);
    throw error;
  }
}

/**
 * Update an existing collaboration package
 */
export async function updateCollabPackage(
  packageId: string,
  updates: Partial<CreateCollabPackageData>,
  updatedBy: string
): Promise<void> {
  try {
    if (!packageId || !updatedBy) {
      throw new Error('Package ID and updater UID are required');
    }

    // Get current package to verify permissions
    const packageDoc = await getDoc(doc(db, 'collabPackages', packageId));
    if (!packageDoc.exists()) {
      throw new Error('Collaboration package not found');
    }

    const currentPackage = packageDoc.data() as CollabPackage;
    
    // Verify that the updater is the creator or a member of the package
    const canUpdate = currentPackage.createdBy === updatedBy || 
                     Object.values(currentPackage.roles).includes(updatedBy);
    
    if (!canUpdate) {
      throw new Error('Unauthorized to update this collaboration package');
    }

    // Prepare update data
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // If roles are being updated, refresh role details
    if (updates.roles) {
      const roleDetails: CollabPackage['roleDetails'] = {};
      
      for (const [role, uid] of Object.entries(updates.roles)) {
        if (uid) {
          try {
            const userProfile = await getUserProfile(uid);
            if (userProfile) {
              roleDetails[role as keyof typeof roleDetails] = {
                name: userProfile.name || userProfile.displayName || 'Unknown',
                profileImage: userProfile.profileImage,
                verified: userProfile.verified || false
              };
            }
          } catch (error) {
            console.warn(`Failed to fetch profile for ${role} (${uid}):`, error);
          }
        }
      }
      
      updateData.roleDetails = roleDetails;
    }

    // Update the document
    const packageRef = doc(db, 'collabPackages', packageId);
    await updateDoc(packageRef, updateData);

    console.log('Collaboration package updated:', packageId);

  } catch (error) {
    console.error('Error updating collaboration package:', error);
    throw error;
  }
}

/**
 * Archive a collaboration package
 */
export async function archiveCollabPackage(
  packageId: string,
  archivedBy: string
): Promise<void> {
  try {
    if (!packageId || !archivedBy) {
      throw new Error('Package ID and archiver UID are required');
    }

    // Get current package to verify permissions
    const packageDoc = await getDoc(doc(db, 'collabPackages', packageId));
    if (!packageDoc.exists()) {
      throw new Error('Collaboration package not found');
    }

    const currentPackage = packageDoc.data() as CollabPackage;
    
    // Verify that the archiver is the creator or a member
    const canArchive = currentPackage.createdBy === archivedBy || 
                      Object.values(currentPackage.roles).includes(archivedBy);
    
    if (!canArchive) {
      throw new Error('Unauthorized to archive this collaboration package');
    }

    // Update status to archived
    const packageRef = doc(db, 'collabPackages', packageId);
    await updateDoc(packageRef, {
      status: 'archived',
      isPublic: false,
      updatedAt: serverTimestamp()
    });

    console.log('Collaboration package archived:', packageId);

  } catch (error) {
    console.error('Error archiving collaboration package:', error);
    throw error;
  }
}

/**
 * Send notifications to package members about creation
 */
async function sendPackageCreationNotifications(
  packageId: string,
  packageData: Omit<CollabPackage, 'id'>,
  createdBy: string
): Promise<void> {
  try {
    const memberUids = Object.values(packageData.roles).filter(uid => uid && uid !== createdBy);
    
    if (memberUids.length === 0) {
      return; // No other members to notify
    }

    // Get creator info
    let creatorName = 'Someone';
    try {
      const creatorProfile = await getUserProfile(createdBy);
      creatorName = creatorProfile?.name || creatorProfile?.displayName || creatorName;
    } catch (error) {
      console.warn('Failed to get creator profile for notification:', error);
    }

    // Send notifications to each member
    const notificationPromises = memberUids.map(async (memberUid) => {
      try {
        const notificationData = {
          type: 'collab_package_added',
          title: 'Added to Collaboration Package',
          message: `${creatorName} added you to the collaboration package "${packageData.title}"`,
          data: {
            packageId,
            packageTitle: packageData.title,
            creatorName,
            createdBy
          },
          read: false,
          createdAt: serverTimestamp()
        };

        const userNotificationsRef = collection(db, 'notifications', memberUid, 'userNotifications');
        await addDoc(userNotificationsRef, notificationData);
        
      } catch (error) {
        console.error(`Failed to send notification to ${memberUid}:`, error);
      }
    });

    await Promise.all(notificationPromises);
    console.log(`Sent package creation notifications to ${memberUids.length} members`);

  } catch (error) {
    console.error('Error sending package creation notifications:', error);
  }
}
