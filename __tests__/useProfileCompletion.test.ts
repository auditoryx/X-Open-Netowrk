import { useProfileCompletion } from '@/lib/hooks/useProfileCompletion';
import { UserProfile } from '@/types/user';

function createProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    uid: 'uid',
    name: 'Test',
    bio: '',
    services: [],
    tags: [],
    media: [],
    availability: [],
    socials: {},
    isVerified: false,
    verificationStatus: undefined,
    status: 'approved',
    createdAt: null,
    timezone: 'UTC',
    ...overrides,
  } as UserProfile;
}

describe('useProfileCompletion', () => {
  it('returns 0% completion for an empty profile', () => {
    const profile = createProfile();
    const { score, checklist } = useProfileCompletion(profile);
    expect(score).toBe(0);
    checklist.forEach(item => expect(item.done).toBe(false));
  });

  it('returns 100% completion when all fields are filled', () => {
    const profile = createProfile({
      bio: 'bio',
      services: ['mixing'],
      availability: ['mon'],
      media: ['file'],
      socials: { instagram: 'insta' },
      verificationStatus: 'verified',
    });
    const { score, checklist } = useProfileCompletion(profile);
    expect(score).toBe(100);
    checklist.forEach(item => expect(item.done).toBe(true));
  });

  it('computes partial completion correctly', () => {
    const profile = createProfile({
      bio: 'bio',
      services: ['mixing'],
    });
    const { score, checklist } = useProfileCompletion(profile);
    expect(score).toBe(33);
    const results = checklist.map(c => c.done);
    expect(results).toEqual([true, true, false, false, false, false]);
  });
});
