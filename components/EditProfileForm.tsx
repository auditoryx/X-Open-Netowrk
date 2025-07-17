"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function EditProfileForm(): JSX.Element {
  const [displayName, setDisplayName] = useState<string>("Zenji");
  const [bio, setBio] = useState<string>("Music visionary. A&R. Creator of vibes.");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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

  const handleDisplayNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setDisplayName(e.target.value);
  };

  const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setBio(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label htmlFor="display-name" className="block mb-1">
          Display Name
        </label>
        <input
          id="display-name"
          className="input-base"
          value={displayName}
          onChange={handleDisplayNameChange}
        />
      </div>
      <div>
        <label htmlFor="bio" className="block mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          className="textarea-base"
          value={bio}
          onChange={handleBioChange}
        />
      </div>
      <button type="submit" className="btn btn-primary">Save Changes</button>
    </form>
  );
}
