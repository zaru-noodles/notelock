import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoteLock",
  description: "Your notes, their future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper-1 text-ink-1">
        {children}
      </body>
    </html>
  );
}
