import { useState } from 'react';
import { createMentorshipService } from '@/lib/firestore/createMentorshipService';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const EXPERTISE_OPTIONS = [
  'Production',
  'Engineering',
  'Songwriting',
  'Mixing',
  'Mastering',
  'Vocal Performance',
  'Branding',
  'Marketing',
  'Music Business',
  'Artist Development',
  'Beat Making',
  'Sound Design',
  'Film Scoring',
  'Music Theory',
  'Recording Techniques',
  'Instrument Lessons',
  'Career Guidance'
];

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

export default function CreateMentorshipForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    format: 'live',
    price: '',
    durationMinutes: '60',
    zoomLink: '',
    maxBookingsPerDay: '3'
  });
  
  const [expertise, setExpertise] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>(['09:00', '13:00', '17:00']);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleExpertiseToggle = (expertiseItem: string) => {
    setExpertise(prev => {
      if (prev.includes(expertiseItem)) {
        return prev.filter(item => item !== expertiseItem);
      } else {
        return [...prev, expertiseItem];
      }
    });
  };
  
  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };
  
  const addTimeSlot = () => {
    if (newTimeSlot && !timeSlots.includes(newTimeSlot)) {
      setTimeSlots(prev => [...prev, newTimeSlot]);
      setNewTimeSlot('');
    }
  };
  
  const removeTimeSlot = (slot: string) => {
    setTimeSlots(prev => prev.filter(s => s !== slot));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a mentorship.');
      return;
    }
    
    if (expertise.length === 0) {
      toast.error('Please select at least one area of expertise.');
      return;
    }
    
    if (formData.format === 'live' && selectedDays.length === 0) {
      toast.error('Please select at least one available day for live sessions.');
      return;
    }
    
    if (formData.format === 'live' && timeSlots.length === 0) {
      toast.error('Please add at least one available time slot for live sessions.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const mentorshipId = await createMentorshipService({
        creatorUid: user.uid,
        title: formData.title,
        description: formData.description,
        format: formData.format as 'live' | 'async',
        price: parseFloat(formData.price),
        durationMinutes: parseInt(formData.durationMinutes),
        availableDays: selectedDays,
        availableTimeSlots: timeSlots,
        zoomLink: formData.zoomLink,
        maxBookingsPerDay: parseInt(formData.maxBookingsPerDay),
        expertise
      });
      
      toast.success('Mentorship created successfully!');
      router.push(`/mentorships/${mentorshipId}`);
    } catch (error) {
      console.error('Error creating mentorship:', error);
      toast.error('Failed to create mentorship. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Mentorship Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., 'Production Feedback Session', 'Songwriting Coaching'"
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          placeholder="Describe what clients will get from your mentorship sessions..."
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Format</label>
        <select
          name="format"
          value={formData.format}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg"
          required
        >
          <option value="live">Live (Zoom Sessions)</option>
          <option value="async">Asynchronous (Feedback on Files)</option>
        </select>
        <p className="text-sm text-gray-500 mt-1">
          {formData.format === 'live' 
            ? 'Live sessions happen via Zoom at scheduled times.' 
            : 'Asynchronous sessions allow clients to upload files and receive feedback within 48 hours.'}
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Price (USD)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="e.g., 99.99"
          min="0"
          step="0.01"
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Duration (Minutes)</label>
        <select
          name="durationMinutes"
          value={formData.durationMinutes}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg"
          required
        >
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
          <option value="90">1.5 hours</option>
          <option value="120">2 hours</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Areas of Expertise</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EXPERTISE_OPTIONS.map(option => (
            <label key={option} className="flex items-center p-2 border rounded">
              <input
                type="checkbox"
                checked={expertise.includes(option)}
                onChange={() => handleExpertiseToggle(option)}
                className="mr-2"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>
      
      {formData.format === 'live' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Zoom Link (Optional)</label>
            <input
              type="text"
              name="zoomLink"
              value={formData.zoomLink}
              onChange={handleInputChange}
              placeholder="e.g., https://zoom.us/j/123456789"
              className="w-full p-3 border rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              You can add this now or later when a booking is confirmed.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-3 py-2 rounded-md text-sm capitalize ${
                    selectedDays.includes(day) 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Available Time Slots</label>
            <div className="flex items-center mb-2">
              <input
                type="time"
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                className="p-2 border rounded-lg mr-2"
              />
              <button
                type="button"
                onClick={addTimeSlot}
                className="px-3 py-2 bg-gray-800 text-white rounded-md text-sm"
              >
                Add Time
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {timeSlots.map(slot => (
                <div key={slot} className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
                  <span className="text-sm mr-2">{slot}</span>
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(slot)}
                    className="text-red-500 text-sm font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Max Bookings Per Day</label>
            <select
              name="maxBookingsPerDay"
              value={formData.maxBookingsPerDay}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
          </div>
        </>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Creating...' : 'Create Mentorship Offer'}
      </button>
    </form>
  );
}
