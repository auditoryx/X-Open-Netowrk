type ProfileData = {
  name?: string;
  bio?: string;
  location?: string;
  links?: string;
  role?: string;
  services?: string[];
  profileImage?: string;
};

export function getProfileCompletion(profile: ProfileData): number {
  const fields = [
    profile.name,
    profile.bio,
    profile.location,
    profile.links,
    profile.role,
    profile.services?.length ? '✔' : '',
    profile.profileImage,
  ];

  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}
