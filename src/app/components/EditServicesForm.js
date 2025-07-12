'use client';
import { useEffect, useState } from 'react';
import { db, auth } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function EditServicesForm() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      const user = auth.currentUser;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();

      setServices(data?.services || []);
      setLoading(false);
    };

    loadServices();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = field === 'price' ? parseFloat(value) : value;
    setServices(updated);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { services });
    alert('Services updated!');
  };

  if (loading) return <p className='text-white'>Loading...</p>;

  return (
    <div>
      <h2 className='text-xl font-semibold mb-4 text-white'>Edit Your Services</h2>
      {services.map((service, i) => (
        <div key={i} className='mb-4 text-white'>
          <input
            type='text'
            value={service.name}
            onChange={(e) => handleChange(i, SCHEMA_FIELDS.USER.NAME, e.target.value)}
            className='border p-2 mr-2'
            placeholder='Service Name'
          />
          <input
            type='number'
            value={service.price}
            onChange={(e) => handleChange(i, SCHEMA_FIELDS.SERVICE.PRICE, e.target.value)}
            className='border p-2 mr-2'
            placeholder='Price'
          />
        </div>
      ))}
      <button onClick={handleSave} className='bg-blue-500 px-4 py-2 text-white rounded'>
        Save Changes
      </button>
    </div>
  );
}

