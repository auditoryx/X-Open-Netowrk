'use client';
import Navbar from '@/app/components/Navbar';
import { useRouter } from "next/router";
import { useTranslations } from "@/lib/i18n/useTranslations";

export default function ClientPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
import { useRouter } from "next/router";
import { useTranslations } from "@/lib/i18n/useTranslations";
      <div className="flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold mb-4">{t("client.dashboard.title")}</h1>
        <p className="text-lg text-gray-400">Manage your bookings, favorites, and interactions.</p>
      </div>
    </div>
  );
}
