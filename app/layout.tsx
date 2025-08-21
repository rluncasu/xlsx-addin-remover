import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
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
        className={`${inter.variable} ${poppins.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
