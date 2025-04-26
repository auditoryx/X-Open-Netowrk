"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    role: "",
    location: "",
    bio: "",
    portfolio: "",
    image: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 🔒 Replace this with Firestore update later
    alert("Profile updated (mock)");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full p-2 rounded bg-gray-800" />
        <input name="role" placeholder="Role" value={form.role} onChange={handleChange} className="w-full p-2 rounded bg-gray-800" />
        <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="w-full p-2 rounded bg-gray-800" />
        <input name="portfolio" placeholder="Portfolio Link" value={form.portfolio} onChange={handleChange} className="w-full p-2 rounded bg-gray-800" />
        <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} className="w-full p-2 rounded bg-gray-800" />
        <textarea name="bio" placeholder="Bio" value={form.bio} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 h-40" />
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Save Changes</button>
      </form>
    </div>
  );
}
