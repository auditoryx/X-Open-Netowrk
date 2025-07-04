import { useState } from 'react';
import { MentorshipService } from '@/lib/types/Mentorship';
import { createMentorshipService } from '@/lib/firestore/createMentorshipService';
import { useAuth } from '@/lib/hooks/useAuth';
import { Plus, X, DollarSign, Clock, Users, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateMentorshipFormProps {
  onSuccess?: (serviceId: string) => void;
  onCancel?: () => void;
}

export default function CreateMentorshipForm({ onSuccess, onCancel }: CreateMentorshipFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    duration: '',
    sessionType: 'one-time' as 'one-time' | 'package',
    maxParticipants: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    deliverables: [''],
    prerequisites: [''],
    targetAudience: [''],
    tags: [''],
    packageDetails: {
      totalSessions: '',
      sessionDuration: '',
      validity: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Music Production',
    'Audio Engineering',
    'Mixing & Mastering',
    'Music Business',
    'Performance',
    'Songwriting',
    'Music Theory',
    'Industry Knowledge'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to create a mentorship service');
      return;
    }

    setIsSubmitting(true);

    try {
      const serviceData: Omit<MentorshipService, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'completedSessions'> = {
        mentorId: user.uid,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        price: parseFloat(formData.price),
        duration: parseFloat(formData.duration),
        sessionType: formData.sessionType,
        packageDetails: formData.sessionType === 'package' ? {
          totalSessions: parseInt(formData.packageDetails.totalSessions),
          sessionDuration: parseInt(formData.packageDetails.sessionDuration),
          validity: parseInt(formData.packageDetails.validity)
        } : undefined,
        deliverables: formData.deliverables.filter(d => d.trim() !== ''),
        prerequisites: formData.prerequisites.filter(p => p.trim() !== ''),
        targetAudience: formData.targetAudience.filter(t => t.trim() !== ''),
        difficulty: formData.difficulty,
        maxParticipants: parseInt(formData.maxParticipants),
        isActive: true,
        tags: formData.tags.filter(t => t.trim() !== '')
      };

      const serviceId = await createMentorshipService(user.uid, serviceData);
      toast.success('Mentorship service created successfully!');
      onSuccess?.(serviceId);
    } catch (error) {
      console.error('Error creating mentorship service:', error);
      toast.error('Failed to create mentorship service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('packageDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        packageDetails: {
          ...prev.packageDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (index: number, value: string, field: 'deliverables' | 'prerequisites' | 'targetAudience' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'deliverables' | 'prerequisites' | 'targetAudience' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index: number, field: 'deliverables' | 'prerequisites' | 'targetAudience' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Mentorship Service</h2>
        <p className="text-gray-600">Share your expertise and help others grow</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 1-on-1 Music Production Mentorship"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what you'll teach and how you'll help mentees..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory
            </label>
            <input
              type="text"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Hip-Hop Production"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Duration (hours)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="0.5"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-1" />
              Max Participants
            </label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Type
            </label>
            <select
              name="sessionType"
              value={formData.sessionType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="one-time">One-time Session</option>
              <option value="package">Package Deal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {formData.sessionType === 'package' && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-3">Package Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Sessions
                </label>
                <input
                  type="number"
                  name="packageDetails.totalSessions"
                  value={formData.packageDetails.totalSessions}
                  onChange={handleChange}
                  min="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Duration (min)
                </label>
                <input
                  type="number"
                  name="packageDetails.sessionDuration"
                  value={formData.packageDetails.sessionDuration}
                  onChange={handleChange}
                  min="30"
                  step="15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validity (days)
                </label>
                <input
                  type="number"
                  name="packageDetails.validity"
                  value={formData.packageDetails.validity}
                  onChange={handleChange}
                  min="7"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="inline w-4 h-4 mr-1" />
            Tags
          </label>
          {formData.tags.map((tag, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={tag}
                onChange={(e) => handleArrayChange(index, e.target.value, 'tags')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Hip-Hop, Beginner-Friendly"
              />
              <button
                type="button"
                onClick={() => removeArrayItem(index, 'tags')}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('tags')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Tag
          </button>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Mentorship Service'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
