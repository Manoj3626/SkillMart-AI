import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SkillMatch AI — Your Skills. Your Future. Your Perfect Match.",
    template: "%s | SkillMatch AI",
  },
  description:
    "AI-powered employment platform: practice live AI interviews, analyze your resume, discover matching jobs, and close your skill gaps — all in one place.",
  keywords: [
    "AI interview",
    "job matching",
    "resume analyzer",
    "skill gap analysis",
    "career platform",
    "mock interview",
  ],
  authors: [{ name: "SkillMatch AI" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "SkillMatch AI — Your Skills. Your Future. Your Perfect Match.",
    description:
      "Practice live AI interviews, analyze your resume, and discover jobs matched to your skills.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillMatch AI",
    description: "AI-powered career development & job matching platform.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
