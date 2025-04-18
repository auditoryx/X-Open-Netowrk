'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useRouter } from 'next/navigation';

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    artistName: '',
    musicLink: '',
    specialty: '',
    portfolio: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (!formData.role) {
        setError('Please select a role to apply for.');
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'applications'), {
        ...formData,
        createdAt: new Date().toISOString()
      });

      setSubmitted(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4">Apply to AuditoryX Open Network</h1>
      <p className="mb-6 text-gray-400">
        Select your role and submit your info to join our verified network of artists, producers, engineers, studios, videographers, and creatives.
      </p>

      {error && <div className="bg-red-800 text-white p-3 rounded mb-4">{error}</div>}
      {submitted ? (
        <div className="bg-green-700 p-4 rounded text-white">
          Application submitted! We’ll get back to you soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-300">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-800 p-2 rounded border border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              className="w-full bg-gray-800 p-2 rounded border border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Role Applying For</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-gray-800 p-2 rounded border border-gray-600"
              required
            >
              <option value="">Select a role</option>
              <option value="artist">Artist</option>
              <option value="producer">Producer</option>
              <option value="engineer">Engineer</option>
              <option value="videographer">Videographer</option>
              <option value="graphic_designer">Graphic Designer</option>
              <option value="studio">Studio</option>
            </select>
          </div>

          {formData.role === 'artist' && (
            <>
              <div>
                <label className="block mb-1 text-gray-300">Artist Name</label>
                <input
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleChange}
                  className="w-full bg-gray-800 p-2 rounded border border-gray-600"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Spotify/Apple Music Link</label>
                <input
                  name="musicLink"
                  value={formData.musicLink}
                  onChange={handleChange}
                  className="w-full bg-gray-800 p-2 rounded border border-gray-600"
                />
              </div>
            </>
          )}

          {['producer', 'engineer', 'videographer', 'graphic_designer', 'studio'].includes(formData.role) && (
            <>
              <div>
                <label className="block mb-1 text-gray-300">Your Specialty</label>
                <input
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="e.g. Mixing, VFX, Studio Booking"
                  className="w-full bg-gray-800 p-2 rounded border border-gray-600"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Portfolio or Website</label>
                <input
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="Link to past work"
                  className="w-full bg-gray-800 p-2 rounded border border-gray-600"
                />
              </div>
            </>
          )}

          <div>
            <label className="block mb-1 text-gray-300">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us what makes you a fit for AuditoryX"
              className="w-full bg-gray-800 p-2 rounded border border-gray-600"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      )}
    </div>
  );
}
