"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import { db } from "../firebase/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { Translate } from "@/i18n/Translate";

export default function ServiceSubmissionForm() {
  const { data: session } = useSession();
  const [serviceName, setServiceName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!session?.user?.email) return;

    try {
      await addDoc(collection(db, "services"), {
        serviceName,
        description,
        price: parseFloat(price),
        email: session.user.email,
        displayName: session.user.name || session.user.email,
        createdAt: serverTimestamp()
      });

      setStatus("Service submitted!");
      setServiceName("");
      setDescription("");
      setPrice("");
    } catch (err) {
      console.error(err);
      setStatus("Submission failed.");
    }
  };

  const handleServiceNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setServiceName(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setDescription(e.target.value);
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPrice(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg space-y-4 max-w-xl">
      <h2 className="text-2xl font-bold">Offer a New Service</h2>
      <input
        type="text"
        placeholder="Service Name"
        value={serviceName}
        onChange={handleServiceNameChange}
        className="w-full p-3 rounded bg-black border border-gray-700 text-white"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={handleDescriptionChange}
        className="w-full p-3 rounded bg-black border border-gray-700 text-white"
        required
      />
      <input
        type="number"
        placeholder="Price (USD)"
        value={price}
        onChange={handlePriceChange}
        className="w-full p-3 rounded bg-black border border-gray-700 text-white"
        required
      />
      <button type="submit" className="btn btn-primary w-full">
        <Translate t="button.submitService" />
      </button>
      {status && <p className="text-sm text-blue-400 mt-2">{status}</p>}
    </form>
  );
}
