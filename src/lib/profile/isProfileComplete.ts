import { UserProfile } from '../../types/user'; // <- relative path fix

export function isProfileComplete(profile: UserProfile): boolean {
  return Boolean(
    profile.name &&
    profile.bio &&
    profile.media?.length > 0 &&
    profile.services?.length > 0 &&
    profile.timezone
  );
}
