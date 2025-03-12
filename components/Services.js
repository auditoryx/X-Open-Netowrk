import Link from "next/link";

export default function Services() {
  return (
    <section className="py-24 bg-black text-white">
      <h2 className="text-center text-4xl font-bold">Why Join AuditoryX?</h2>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-gray-800 rounded-lg text-center hover:bg-gray-700 transition">
          <h3 className="text-xl font-bold">🎵 Artists & Producers</h3>
          <p className="text-gray-400 mt-2">Find beats, engineers, and collaborators to bring your music to life.</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg text-center hover:bg-gray-700 transition">
          <h3 className="text-xl font-bold">🎥 Videographers</h3>
          <p className="text-gray-400 mt-2">Book and connect with industry-level video creators for your projects.</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg text-center hover:bg-gray-700 transition">
          <h3 className="text-xl font-bold">🎚️ Studios & Engineers</h3>
          <p className="text-gray-400 mt-2">Find top-tier recording and mixing engineers to finalize your tracks.</p>
        </div>
      </div>
    </section>
  );
}
