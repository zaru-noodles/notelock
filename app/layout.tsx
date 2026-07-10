import type { Metadata } from "next";
import { Newsreader, Geist, Caveat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "NoteLock",
  description: "Your notes, their future.",
};

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  axes: ["opsz"],
  style: ["normal", "italic"],
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrainsmono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${newsreader.variable} ${geist.variable} ${caveat.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-paper-1 text-ink-1">
        <NextTopLoader
          color="#c75a2e"
          height={3}
          showSpinner={false}
          shadow={false}
        />
        {children}
      </body>
    </html>
  );
}
