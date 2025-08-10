"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function EditProfileForm(): JSX.Element {
  const [displayName, setDisplayName] = useState<string>("Zenji");
  const [bio, setBio] = useState<string>("Music visionary. A&R. Creator of vibes.");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }

    setIsLoading(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { displayName, bio },
        { merge: true }
      );
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error('Profile update failed:', err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
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
      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
