"use client";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { Service } from "../src/types/service";

interface ServiceFormData {
  serviceName: string;
  price: string;
  description: string;
}

export default function ServiceManager(): JSX.Element {
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceFormData>({
    serviceName: "",
    price: "",
    description: "",
  });

  const fetchServices = async (): Promise<void> => {
    if (!session?.user?.email) return;
    const snap = await getDocs(collection(db, "services"));
    const userServices = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((s) => s.email === session.user.email) as Service[];
    setServices(userServices);
  };

  useEffect(() => {
    fetchServices();
  }, [session]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!session?.user?.email) return;
    
    await addDoc(collection(db, "services"), {
      ...form,
      price: parseFloat(form.price),
      email: session.user.email,
      displayName: session.user.name || "No Name",
      role: "user" as const,
      title: form.serviceName,
      serviceName: form.serviceName,
      userId: session.user.email,
      createdAt: Date.now(),
    });
    
    setForm({ serviceName: "", price: "", description: "" });
    fetchServices();
  };

  const handleDelete = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "services", id));
    fetchServices();
  };

  return (
    <div className="space-y-10">
      <form onSubmit={handleAdd} className="space-y-4 max-w-xl bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white">Add New Service</h2>
        <input
          name="serviceName"
          value={form.serviceName}
          onChange={handleChange}
          placeholder="Service Name"
          className="w-full p-3 rounded bg-black border border-gray-700 text-white"
          required
        />
        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          type="number"
          className="w-full p-3 rounded bg-black border border-gray-700 text-white"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-3 rounded bg-black border border-gray-700 text-white"
        />
        <button type="submit" className="btn btn-primary w-full">Add Service</button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Your Services</h2>
        {services.length === 0 && <p className="text-gray-400">No services yet.</p>}
        {services.map((s) => (
          <div key={s.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <p><strong>{s.serviceName}</strong> – ${s.price}</p>
            <p className="text-gray-400 text-sm">{s.description}</p>
            <button onClick={() => handleDelete(s.id)} className="text-red-400 mt-2">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
