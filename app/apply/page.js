import Link from "next/link";

export default function ApplyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-4xl font-bold">Apply to AuditoryX Open Network</h1>
      <p className="mt-4 text-lg text-center max-w-2xl">
        Whether you're an **artist** looking for collaborations or a **creative** offering services, AuditoryX gives you access to the **global industry**.
      </p>

      <div className="mt-8 flex flex-col space-y-4 w-full max-w-sm">
        <Link href="/apply/artist">
          <button className="w-full px-6 py-3 bg-blue-500 rounded-md hover:bg-blue-600">
            Apply as an Artist
          </button>
        </Link>

        <Link href="/apply/creative">
          <button className="w-full px-6 py-3 bg-gray-500 rounded-md hover:bg-gray-600">
            Apply as a Creative
          </button>
        </Link>
      </div>
    </div>
  );
}
