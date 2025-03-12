"use client";

import BackgroundAnimation from "./components/BackgroundAnimation";
import Navbar from "./components/Navbar";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>AuditoryX Open Network</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="relative min-h-screen bg-black text-white">
        <BackgroundAnimation />
        <Navbar />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
