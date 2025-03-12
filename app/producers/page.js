"use client";
import { useState } from "react";
import profiles from "../../data/profiles.json";

export default function ProducersPage() {
  const [search, setSearch] = useState("");

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.role === "Producer" &&
      profile.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Find Industry-Leading Producers</h1>
      <input
        type="text"
        placeholder="Search producers..."
        className="w-full p-3 rounded-lg bg-gray-800 text-white mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <div key={profile.id} className="bg-gray-900 p-4 rounded-lg text-white">
            <img src={profile.image} alt={profile.name} className="w-full h-40 object-cover rounded-md" />
            <h2 className="text-xl font-bold mt-2">{profile.name}</h2>
            <p className="text-gray-400">{profile.location}</p>
            <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-400 mt-2 block">
              View Portfolio
            </a>
            <a href={`mailto:${profile.contact}`} className="text-blue-400">Contact</a>
          </div>
        ))}
      </div>
    </div>
  );
}
