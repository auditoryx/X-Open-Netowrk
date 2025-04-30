'use client';

import { useEffect, useState } from 'react';
import { toggleFavorite } from '@/lib/firestore/toggleFavorite';
import { useAuth } from '@/lib/hooks/useAuth';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';

type Props = {
  creatorId: string;
};

export default function SaveButton({ creatorId }: Props) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    setSaved(favorites[creatorId] === true);
  }, [user, creatorId]);

  const toggle = async () => {
    if (!user) return;
    const newState = !saved;
    setSaved(newState);
    localStorage.setItem(
      'favorites',
      JSON.stringify({
        ...JSON.parse(localStorage.getItem('favorites') || '{}'),
        [creatorId]: newState,
      })
    );
    await toggleFavorite(user.uid, creatorId, newState);
  };

  return (
    <button onClick={toggle} className="text-xl">
      {saved ? <AiFillStar className="text-yellow-500" /> : <AiOutlineStar />}
    </button>
  );
}
