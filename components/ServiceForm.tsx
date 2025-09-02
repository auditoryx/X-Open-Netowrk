"use client";
import { useState, FormEvent } from "react";
import { db } from "../firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";

interface ServiceFormProps {
  userId: string;
  role: 'creator' | 'admin' | 'user';
}

export default function ServiceForm({ userId, role }: ServiceFormProps) {
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "services"), {
        title,
        price,
        desc,
        userId,
        role,
        createdAt: Date.now()
      });
      setStatus("Service added!");
      setTitle(""); setPrice(""); setDesc("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to add service.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-900 rounded-lg max-w-xl text-white">
      <h2 className="text-2xl font-bold">Add a Service</h2>

      <input
        placeholder="Service Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 rounded bg-black border border-gray-700"
        required
      />
      <input
        placeholder="Price (USD)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-3 rounded bg-black border border-gray-700"
        type="number"
        required
      />
      <textarea
        placeholder="Describe your service..."
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="w-full p-3 rounded bg-black border border-gray-700"
        required
      />
      <button type="submit" className="btn btn-primary w-full">Submit</button>
      {status && <p className="text-sm mt-2">{status}</p>}
    </form>
  );
}
