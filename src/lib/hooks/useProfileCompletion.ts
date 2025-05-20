import { UserProfile } from '@/types/user'

export function useProfileCompletion(profile: UserProfile) {
  const checklist = [
    { key: 'bio', label: 'Add a bio', done: !!profile.bio },
    { key: 'services', label: 'Add at least 1 service', done: profile.services?.length > 0 },
    { key: 'availability', label: 'Set availability', done: profile.availability?.length > 0 },
    { key: 'media', label: 'Upload portfolio media', done: profile.media?.length > 0 },
    {
      key: 'socials',
      label: 'Add at least one social link',
      done: !!(profile.socials?.instagram || profile.socials?.twitter || profile.socials?.spotify),
    },
  ]

  const score = Math.round((checklist.filter(i => i.done).length / checklist.length) * 100)

  return { score, checklist }
}
