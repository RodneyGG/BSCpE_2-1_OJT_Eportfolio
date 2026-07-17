import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RoleProvider } from "./context/RoleContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OJT Tracker | BSCpE 2-1",
  description:
    "On-the-Job Training tracker for BSCpE 2-1 — track companies, students, weekly logs, and OJT documents.",
  keywords: ["OJT", "Tracker", "BSCpE", "Computer Engineering", "On-the-Job Training"],
  openGraph: {
    title: "OJT Tracker | BSCpE 2-1",
    description: "On-the-Job Training tracker for BSCpE 2-1 students.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  );
}
