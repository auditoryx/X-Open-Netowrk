"use client";
import { useRouter } from "next/navigation";
import profiles from "../../data/profiles.json";
import BookingForm from "../components/BookingForm";

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const profile = profiles.find((p) => p.id === parseInt(id));

  if (!profile) return <p className="text-white text-center">Profile not found</p>;

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-4xl font-bold">{profile.name}</h1>
      <p className="text-gray-400">{profile.role} - {profile.location}</p>
      <img src={profile.image} alt={profile.name} className="w-full h-60 object-cover rounded-md mt-4" />
      <p className="mt-4">{profile.bio}</p>
      <a href={profile.portfolio} className="text-blue-400 mt-4 block">View Portfolio</a>
      <BookingForm recipient={profile.name} />
    </div>
  );
}
