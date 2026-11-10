import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TNPSC AI Companion",
  description: "Your personal AI-powered TNPSC study and revision companion."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
