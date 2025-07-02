import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/hooks/useAuth";
import { BookingSlot } from "@/lib/types/BookingSlot";
import { userHasAccessToSlot } from "@/lib/utils/userHasAccessToSlot";
import { LockIcon, CalendarIcon, ClockIcon, DollarSignIcon, MapPinIcon } from "lucide-react";
import { format } from "date-fns";

interface BookingCardProps {
  bookingSlot: BookingSlot;
  onBookNow?: (slotId: string) => void;
}

export default function BookingCard({ bookingSlot, onBookNow }: BookingCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Calculate if user has access to this booking slot
  const hasAccess = user ? userHasAccessToSlot(bookingSlot, user) : false;
  
  // Format date and time from scheduledAt timestamp
  const date = bookingSlot.scheduledAt.toDate();
  const formattedDate = format(date, "MMMM d, yyyy");
  const formattedTime = format(date, "h:mm a");
  
  // Handle booking action
  const handleBookNow = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    if (!hasAccess) {
      return; // Don't allow booking if user doesn't have access
    }
    
    if (onBookNow) {
      onBookNow(bookingSlot.id);
    } else {
      router.push(`/booking/${bookingSlot.id}`);
    }
  };
  
  return (
    <div className={`relative border rounded-lg overflow-hidden shadow-sm
      ${!hasAccess && bookingSlot.inviteOnly 
        ? "opacity-75 bg-gray-100 dark:bg-gray-800" 
        : "bg-white dark:bg-gray-700"}`}
    >
      {/* Invite-Only Badge */}
      {bookingSlot.inviteOnly && (
        <div className="absolute top-2 right-2 flex items-center bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
          <LockIcon size={12} className="mr-1" />
          <span>Invite Only</span>
        </div>
      )}
      
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold line-clamp-1">
            {bookingSlot.title || "Booking Session"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {bookingSlot.description || "No description provided."}
          </p>
        </div>
        
        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <CalendarIcon size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <ClockIcon size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
            <span>{formattedTime} ({bookingSlot.durationMinutes} mins)</span>
          </div>
          
          {bookingSlot.price && (
            <div className="flex items-center text-sm">
              <DollarSignIcon size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
              <span>${bookingSlot.price.toFixed(2)}</span>
            </div>
          )}
          
          {bookingSlot.location && (
            <div className="flex items-center text-sm">
              <MapPinIcon size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
              <span className="line-clamp-1">{bookingSlot.location}</span>
            </div>
          )}
        </div>
        
        {/* Access requirements for invite-only slots */}
        {bookingSlot.inviteOnly && (
          <div className="mb-4 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <p className="font-medium">Access Requirements:</p>
            <ul className="list-disc list-inside">
              {bookingSlot.minRank && (
                <li>Minimum rank: {bookingSlot.minRank}</li>
              )}
              {bookingSlot.allowedUids && bookingSlot.allowedUids.length > 0 && (
                <li>Specific users: {bookingSlot.allowedUids.length} invited</li>
              )}
            </ul>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end">
          <button
            onClick={handleBookNow}
            disabled={!hasAccess && bookingSlot.inviteOnly}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium
              ${!hasAccess && bookingSlot.inviteOnly
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {!hasAccess && bookingSlot.inviteOnly ? (
              <span className="flex items-center">
                <LockIcon size={14} className="mr-1" />
                Restricted
              </span>
            ) : (
              "Book Now"
            )}
          </button>
        </div>
        
        {/* Access restricted message */}
        {!hasAccess && bookingSlot.inviteOnly && (
          <p className="text-xs text-red-500 mt-2 text-center">
            This session is by invitation only
          </p>
        )}
      </div>
    </div>
  );
}
