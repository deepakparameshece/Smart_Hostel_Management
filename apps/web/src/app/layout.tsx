import type { Metadata } from "next";
import { Inter, Outfit, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import Chatbot from "@/components/Chatbot";
import CustomNotificationProvider from "@/components/CustomNotificationProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
});

export const metadata: Metadata = {
  title: "SmartHostel | Production-Grade Management",
  description: "Advanced hostel management system for modern institutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} ${hankenGrotesk.variable} antialiased min-h-screen bg-slate-50 text-slate-900`}
      >
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (window.performance && window.performance.getEntriesByType) {
              var navs = window.performance.getEntriesByType('navigation');
              if (navs.length > 0 && navs[0].type === 'reload') {
                window.location.href = '/';
              }
            }
          } catch(e) {}
        ` }} />
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-background to-background"></div>
        {children}
        <Chatbot />
        <CustomNotificationProvider />
      </body>
    </html>
  );
}
