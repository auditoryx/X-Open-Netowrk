import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createBookingSlot } from "@/lib/firestore/createBookingSlot";
import toast from "react-hot-toast";

interface BookingSlotFormProps {
  onSlotCreated?: (slotId: string) => void;
  onCancel?: () => void;
}

export default function BookingSlotForm({ onSlotCreated, onCancel }: BookingSlotFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60); // minutes
  const [price, setPrice] = useState(0);
  
  // Invite-only settings
  const [inviteOnly, setInviteOnly] = useState(false);
  const [minRank, setMinRank] = useState<"verified" | "signature" | "top5" | "">("");
  const [allowedUids, setAllowedUids] = useState<string[]>([]);
  const [uidInput, setUidInput] = useState("");
  
  // Calculate minimum date (today)
  const todayString = new Date().toISOString().split("T")[0];
  
  if (!user) {
    return (
      <div className="p-4 border rounded bg-gray-800 text-white">
        <p>Please log in to create booking slots.</p>
      </div>
    );
  }
  
  const handleAddUid = () => {
    if (uidInput && !allowedUids.includes(uidInput)) {
      setAllowedUids([...allowedUids, uidInput]);
      setUidInput("");
    }
  };
  
  const handleRemoveUid = (uid: string) => {
    setAllowedUids(allowedUids.filter(id => id !== uid));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }
    
    if (loading) return;
    setLoading(true);
    
    try {
      const scheduledAt = new Date(`${date}T${time}`);
      
      // Prepare the parameters for createBookingSlot
      const slotParams = {
        providerUid: user.uid,
        scheduledAt,
        durationMinutes: duration,
        inviteOnly,
        title,
        description,
        price: price > 0 ? price : undefined
      };
      
      // Add invite-only specific fields if enabled
      if (inviteOnly) {
        if (minRank && minRank !== "") {
          slotParams["minRank"] = minRank as "verified" | "signature" | "top5";
        }
        
        if (allowedUids.length > 0) {
          slotParams["allowedUids"] = allowedUids;
        }
      }
      
      const slotId = await createBookingSlot(slotParams);
      toast.success("Booking slot created successfully!");
      
      if (onSlotCreated) {
        onSlotCreated(slotId);
      }
      
      // Reset form
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setDuration(60);
      setPrice(0);
      setInviteOnly(false);
      setMinRank("");
      setAllowedUids([]);
      
    } catch (error) {
      console.error("Error creating booking slot:", error);
      toast.error("Failed to create booking slot");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white dark:bg-gray-800 text-black dark:text-white">
      <h2 className="text-xl font-semibold mb-4">Create Booking Slot</h2>
      
      {/* Basic slot details */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
          placeholder="Session title"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
          placeholder="Session description"
        />
      </div>
      
      {/* Date and time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={todayString}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            required
          />
        </div>
        
        <div>
          <label htmlFor="time" className="block text-sm font-medium">Time</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            required
          />
        </div>
      </div>
      
      {/* Duration and price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium">Duration (minutes)</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            min="15"
            step="15"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            required
          />
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium">Price (USD)</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            min="0"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
          />
        </div>
      </div>
      
      {/* Invite-only settings */}
      <div className="border-t pt-4 mt-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="inviteOnly"
            checked={inviteOnly}
            onChange={(e) => setInviteOnly(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="inviteOnly" className="ml-2 block text-sm font-medium">
            Invite-Only Session
          </label>
        </div>
        
        {inviteOnly && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-700">
            <div>
              <label htmlFor="minRank" className="block text-sm font-medium">Minimum Rank Required</label>
              <select
                id="minRank"
                value={minRank}
                onChange={(e) => setMinRank(e.target.value as any)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg dark:bg-gray-700"
              >
                <option value="">No rank requirement</option>
                <option value="verified">Verified</option>
                <option value="signature">Signature</option>
                <option value="top5">Top 5%</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Users with this rank or higher can book this slot
              </p>
            </div>
            
            <div>
              <label htmlFor="allowedUids" className="block text-sm font-medium">Allowed Users</label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  id="allowedUids"
                  value={uidInput}
                  onChange={(e) => setUidInput(e.target.value)}
                  placeholder="Enter user ID or email"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                />
                <button
                  type="button"
                  onClick={handleAddUid}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add
                </button>
              </div>
              
              {allowedUids.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Allowed Users:</h4>
                  <ul className="mt-1 space-y-1">
                    {allowedUids.map((uid) => (
                      <li key={uid} className="flex items-center justify-between text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                        <span>{uid}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveUid(uid)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                These users will be able to book regardless of rank
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Creating..." : "Create Slot"}
        </button>
      </div>
    </form>
  );
}
