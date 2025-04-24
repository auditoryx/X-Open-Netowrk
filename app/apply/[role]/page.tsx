'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { submitApplication } from '@/lib/submitApplication';

export default function RoleApplicationPage() {
  const params = useParams();
  const rawRole = params?.role ? (Array.isArray(params.role) ? params.role[0] : params.role) : '';
  const role = decodeURIComponent(rawRole).toUpperCase();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitApplication({ name, email, experience, role });
    if (result.success) {
      setSubmitted(true);
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <main className='min-h-screen bg-black text-white p-10'>
      <h1 className='text-3xl font-bold mb-4'>Apply as a {role}</h1>

      {submitted ? (
        <div className='text-green-400 font-medium'>Application submitted successfully.</div>
      ) : (
        <form onSubmit={handleSubmit} className='space-y-6 mt-6 max-w-xl'>
          <input
            type='text'
            placeholder='Full Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full p-3 bg-gray-800 rounded text-white border border-gray-700'
          />
          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full p-3 bg-gray-800 rounded text-white border border-gray-700'
          />
          <textarea
            placeholder={`Tell us about your ${role} experience...`}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className='w-full p-3 h-40 bg-gray-800 rounded text-white border border-gray-700'
          />
          <button type='submit' className='btn btn-primary w-full'>
            Submit Application
          </button>
          {error && <p className='text-red-500 mt-2'>{error}</p>}
        </form>
      )}
    </main>
  );
}

