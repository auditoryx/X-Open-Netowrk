'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function EditProfileForm() {
  const [profile, setProfile] = useState({
    bio: '',
    experience: '',
    credits: '',
    skills: '',
    socials: ''
  });

  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile({ ...profile, ...docSnap.data() });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, profile, { merge: true });
    alert('Profile updated!');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-gray-800 p-4 rounded-md text-white">
      <h2 className="text-xl font-semibold mb-2">Edit Profile</h2>
      {['bio', 'experience', 'credits', 'skills', 'socials'].map(field => (
        <div className="mb-2" key={field}>
          <label className="block capitalize mb-1">{field}</label>
          <textarea
            name={field}
            value={profile[field]}
            onChange={handleChange}
            className="w-full p-2 text-black rounded"
            rows="2"
          />
        </div>
      ))}
      <button onClick={handleSave} className="bg-blue-500 px-4 py-2 rounded mt-2">
        Save Changes
      </button>
    </div>
  );
}
