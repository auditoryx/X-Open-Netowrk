"use client";
import { useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function EditProfileForm() {
  const [displayName, setDisplayName] = useState("Zenji");
  const [bio, setBio] = useState("Music visionary. A&R. Creator of vibes.");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { displayName, bio },
        { merge: true }
      );
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="block mb-1">Display Name</label>
        <input
          className="input-base"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div>
        <label className="block mb-1">Bio</label>
        <textarea
          className="textarea-base"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary">Save Changes</button>
    </form>
  );
}
