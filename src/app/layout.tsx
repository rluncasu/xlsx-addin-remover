import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
