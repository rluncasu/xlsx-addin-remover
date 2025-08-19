import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Excel Addin Remover",
  description: "Upload Excel files, analyze addins, and remove unwanted ones easily",
  keywords: ["Excel", "Addin", "Remover", "Office", "XLSX", "API"],
  authors: [{ name: "Excel Addin Remover Team" }],
  openGraph: {
    title: "Excel Addin Remover",
    description: "Upload Excel files, analyze addins, and remove unwanted ones easily",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
