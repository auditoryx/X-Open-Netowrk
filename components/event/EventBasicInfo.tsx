import React from 'react';

interface EventBasicInfoProps {
  formData: {
    title: string;
    description: string;
    eventDate: string;
    location: string;
    totalBudget: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function EventBasicInfo({ formData, onInputChange }: EventBasicInfoProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Event Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onInputChange}
          className="w-full p-3 border rounded-lg"
          placeholder="e.g., Music Video Shoot, Album Recording Session"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Event Date</label>
        <input
          type="datetime-local"
          name="eventDate"
          value={formData.eventDate}
          onChange={onInputChange}
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={onInputChange}
          className="w-full p-3 border rounded-lg"
          placeholder="e.g., Studio Name, City, or Remote"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onInputChange}
          className="w-full p-3 border rounded-lg"
          rows={4}
          placeholder="Describe your event, vision, and any specific requirements..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Total Budget (Optional)</label>
        <input
          type="number"
          name="totalBudget"
          value={formData.totalBudget}
          onChange={onInputChange}
          className="w-full p-3 border rounded-lg"
          placeholder="Enter total budget in USD"
          min="0"
          step="0.01"
        />
      </div>
    </>
  );
}