import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@lib/firebase/init';
import { getNextDateForWeekday } from '@lib/google/utils';

export const updateAvailability = async (providerId: string, availability: string[]) => {
  const providerRef = doc(firestore, 'users', providerId);
  const now = Date.now();
  const nextTs = (() => {
    const times = availability
      .map((s) => {
        const [day, time] = s.split(' ');
        return new Date(`${getNextDateForWeekday(day)}T${time}:00`).getTime();
      })
      .filter((t) => t > now);
    return times.length ? Math.min(...times) : null;
  })();

  await updateDoc(providerRef, { availability, nextAvailableTs: nextTs });
};
