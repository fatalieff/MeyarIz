import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "MathRank", template: "%s · MathRank" },
  description: "Ağıllı repetitor idarəetməsi və şagird performansı platforması",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="az"
      suppressHydrationWarning
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full"><div className="noise" />{children}<Toaster richColors position="top-right" /></body>
    </html>
  );
}
