'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { assignRole } from '@/lib/assignRole';
import { logActivity } from '@/lib/firestore/logging/logActivity';
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS';
import { toast } from 'sonner';

interface ProfileFormProps {
  className?: string;
  onSave?: () => void;
  showCompletionMeter?: boolean;
}

export default function ProfileForm({ 
  className = '', 
  onSave,
  showCompletionMeter = true 
}: ProfileFormProps) {
  const [form, setForm] = useState({
    visible: true,
    name: '',
    role: '',
    bio: '',
    instagram: '',
    availability: '',
    location: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  });

  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        try {
          const ref = doc(db, 'users', user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            setForm((prev) => ({ 
              ...prev, 
              ...data,
              timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
            }));
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          toast.error('Failed to load profile data');
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) {
      toast.error('User not authenticated.');
      return;
    }

    if (!form.name.trim()) {
      toast.error('Please enter your name.');
      return;
    }

    if (!form.role.trim()) {
      toast.error('Please select a role.');
      return;
    }

    setSaving(true);

    try {
      // Save profile data
      await setDoc(doc(db, 'users', uid), {
        ...form,
        name: form.name.trim(),
        bio: form.bio.trim(),
        instagram: form.instagram.trim(),
        availability: form.availability.trim(),
        location: form.location.trim(),
        updatedAt: new Date(),
      }, { merge: true });

      // Assign role if changed
      if (form.role.trim()) {
        await assignRole(uid, form.role.trim());
      }

      // Log activity
      await logActivity(uid, 'profile_update', {
        name: form.name,
        role: form.role,
        completionPercent: getCompletionPercent()
      });

      toast.success('Profile saved successfully!');
      onSave?.();
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getCompletionPercent = () => {
    const requiredFields = ['name', 'role', 'bio', 'location'];
    const optionalFields = ['instagram', 'availability', 'timezone'];
    
    const requiredFilled = requiredFields.filter((key) => 
      form[key as keyof typeof form] && 
      String(form[key as keyof typeof form]).trim().length > 0
    ).length;
    
    const optionalFilled = optionalFields.filter((key) => 
      form[key as keyof typeof form] && 
      String(form[key as keyof typeof form]).trim().length > 0
    ).length;

    // Required fields count for 70%, optional for 30%
    const requiredWeight = (requiredFilled / requiredFields.length) * 70;
    const optionalWeight = (optionalFilled / optionalFields.length) * 30;
    
    return Math.round(requiredWeight + optionalWeight);
  };

  if (loading) {
    return (
      <div className={`max-w-2xl mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
          <div className="h-20 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  const percent = getCompletionPercent();

  const roleOptions = [
    { value: '', label: 'Select your role...' },
    { value: 'artist', label: 'Artist' },
    { value: 'engineer', label: 'Audio Engineer' },
    { value: 'producer', label: 'Music Producer' },
    { value: 'videographer', label: 'Videographer' },
    { value: 'studio', label: 'Studio Owner' },
  ];

  return (
    <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
      {showCompletionMeter && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Profile Completion</h3>
            <span className="text-sm text-gray-500">{percent}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          {percent < 70 && (
            <p className="text-xs text-amber-600">
              Complete required fields to appear in search results
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name - Required */}
          <div className="md:col-span-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your professional name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Role - Required */}
          <div className="md:col-span-1">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bio - Required */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio <span className="text-red-500">*</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Tell potential clients about your experience and style..."
            rows={4}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {form.bio.length}/500 characters
          </div>
        </div>

        {/* Location - Required */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            placeholder="City, Country (e.g., Tokyo, Japan)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
              Instagram
            </label>
            <input
              id="instagram"
              name="instagram"
              type="text"
              value={form.instagram}
              onChange={handleChange}
              placeholder="@username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <input
              id="availability"
              name="availability"
              type="text"
              value={form.availability}
              onChange={handleChange}
              placeholder="e.g., Available weekends"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
            Timezone
          </label>
          <input
            id="timezone"
            name="timezone"
            type="text"
            value={form.timezone}
            onChange={handleChange}
            placeholder="Your timezone"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="visible"
            name="visible"
            checked={form.visible}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div>
            <label htmlFor="visible" className="text-sm font-medium text-gray-700">
              Make profile publicly visible
            </label>
            <p className="text-xs text-gray-500">
              When enabled, your profile will appear in search results and be bookable by clients
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            disabled={saving || !form.name.trim() || !form.role.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}