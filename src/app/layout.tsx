import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PuckTiers - Ro-Hockey Rankings",
  description: "Competitive Roblox Hockey player rankings and tier list system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} animated-bg min-h-screen`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
