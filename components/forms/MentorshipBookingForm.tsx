import { useState, useEffect } from 'react';
import { createMentorshipBooking } from '@/lib/firestore/createMentorshipBooking';
import { Mentorship } from '@/lib/types/Mentorship';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { uploadMultipleFiles } from '@/lib/storage/uploadFiles';

interface MentorshipBookingFormProps {
  mentorship: Mentorship;
}

export default function MentorshipBookingForm({ mentorship }: MentorshipBookingFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    sessionGoal: '',
    scheduledDate: '',
    scheduledTime: '',
  });
  
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [projectFileUrls, setProjectFileUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Generate available dates based on the mentorship's available days
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  
  useEffect(() => {
    if (mentorship.format === 'live') {
      // Generate dates for the next 30 days
      const dates: string[] = [];
      const today = new Date();
      const availableDaysOfWeek = mentorship.availableDays?.map(day => {
        const daysMap: {[key: string]: number} = {
          sunday: 0, monday: 1, tuesday: 2, wednesday: 3, 
          thursday: 4, friday: 5, saturday: 6
        };
        return daysMap[day.toLowerCase()];
      }) || [];
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        
        if (availableDaysOfWeek.includes(date.getDay())) {
          const formattedDate = date.toISOString().split('T')[0];
          dates.push(formattedDate);
        }
      }
      
      setAvailableDates(dates);
    }
  }, [mentorship]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setProjectFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setProjectFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Mock function to simulate file upload - in a real app, this would upload to Firebase Storage
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    
    // Mock upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, you would upload to Firebase Storage and get download URLs
    const mockUrls = files.map(file => `https://storage.example.com/${file.name}`);
    
    setIsUploading(false);
    return mockUrls;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to book a mentorship.');
      return;
    }
    
    if (mentorship.format === 'live' && (!formData.scheduledDate || !formData.scheduledTime)) {
      toast.error('Please select a date and time for your live session.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload files if any
      let uploadedFileUrls: string[] = [];
      if (projectFiles.length > 0) {
        setIsUploading(true);
        try {
          uploadedFileUrls = await uploadMultipleFiles(projectFiles, 'mentorships/projectFiles');
          setProjectFileUrls(uploadedFileUrls);
        } catch (error) {
          console.error('Error uploading files:', error);
          toast.error('Failed to upload files. Please try again.');
          setIsSubmitting(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }
      
      // Create booking
      const bookingData: any = {
        mentorshipId: mentorship.id,
        clientUid: user.uid,
        sessionGoal: formData.sessionGoal,
        projectFiles: uploadedFileUrls,
      };
      
      // Add scheduled date for live sessions
      if (mentorship.format === 'live' && formData.scheduledDate && formData.scheduledTime) {
        const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
        bookingData.scheduledAt = scheduledAt;
      }
      
      const bookingId = await createMentorshipBooking(bookingData);
      
      toast.success('Mentorship booked successfully!');
      router.push(`/bookings/${bookingId}`);
    } catch (error) {
      console.error('Error booking mentorship:', error);
      toast.error('Failed to book mentorship. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Book Mentorship Session</h2>
      <p className="mb-6">{mentorship.format === 'live' ? 'Schedule a live session' : 'Request asynchronous feedback'}</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">What would you like to achieve in this session?</label>
          <textarea
            name="sessionGoal"
            value={formData.sessionGoal}
            onChange={handleInputChange}
            rows={4}
            placeholder="Describe your goals, questions, or what you need help with..."
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>
        
        {mentorship.format === 'live' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <select
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                required
              >
                <option value="">Select a date</option>
                {availableDates.map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Select Time</label>
              <select
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                required
              >
                <option value="">Select a time</option>
                {mentorship.availableTimeSlots?.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-2">Upload Project Files (Optional)</label>
          <div className="border-dashed border-2 border-gray-300 p-4 rounded-lg">
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              className="mb-2"
            />
            <p className="text-xs text-gray-500">Upload audio files, documents, or anything you'd like feedback on.</p>
          </div>
          
          {projectFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Selected Files</h4>
              <ul className="space-y-1">
                {projectFiles.map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="py-3 bg-gray-50 px-4 rounded-lg">
          <div className="flex justify-between mb-1">
            <span className="text-sm">Session Fee</span>
            <span className="font-medium">${mentorship.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Duration</span>
            <span>{mentorship.durationMinutes} minutes</span>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full py-3 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Processing...' : isUploading ? 'Uploading Files...' : `Book for $${mentorship.price}`}
        </button>
      </form>
    </div>
  );
}
