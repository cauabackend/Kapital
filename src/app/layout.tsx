import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Fraunces } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kapital — Personal Finance",
  description: "Track your finances with clarity and precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", jakarta.variable, fraunces.variable)}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
