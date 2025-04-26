"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("artist");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // Save user info to Firestore
      await setDoc(doc(db, "users", email), {
        email,
        uid,
        role,
      });

      // Redirect based on role
      switch (role) {
        case "engineer":
          router.push("/dashboard/engineer");
          break;
        case "producer":
          router.push("/dashboard/producer");
          break;
        case "studio":
          router.push("/dashboard/studio");
          break;
        case "videographer":
          router.push("/dashboard/videographer");
          break;
        case "artist":
        default:
          router.push("/dashboard/artist");
          break;
      }
    } catch (err) {
      console.error(err);
      setError("Signup failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form onSubmit={handleSignup} className="space-y-4 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 rounded bg-gray-900 border border-gray-700"
        >
          <option value="artist">Artist</option>
          <option value="engineer">Engineer</option>
          <option value="producer">Producer</option>
          <option value="studio">Studio</option>
          <option value="videographer">Videographer</option>
        </select>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="btn btn-primary w-full">
          Sign Up
        </button>
      </form>
    </div>
  );
}
