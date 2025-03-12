"use client";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert("Message sent!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 text-white">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-gray-400 max-w-2xl">Have questions? Want to collaborate? Send us a message.</p>
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-lg mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input type="text" placeholder="Your Name" className="p-3 bg-gray-800 text-white rounded-md" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Your Email" className="p-3 bg-gray-800 text-white rounded-md" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <textarea placeholder="Your Message" className="p-3 bg-gray-800 text-white rounded-md h-28" value={message} onChange={(e) => setMessage(e.target.value)} required />
          <button type="submit" className="bg-blue-600 p-3 rounded-md text-white hover:bg-blue-700">Send Message</button>
        </form>
      </div>
    </div>
  );
}
