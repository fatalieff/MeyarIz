import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "MeyarİZ", template: "%s · MeyarİZ" },
  description: "Hər nəticənin bir izi var",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="az"
      suppressHydrationWarning
      data-nav-layout="open"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <head><script dangerouslySetInnerHTML={{__html:`(function(){try{var v=localStorage.getItem("mathrank-navigation-layout");if(v==="collapsed"||v==="open"||v==="horizontal")document.documentElement.dataset.navLayout=v}catch(e){}})()`}}/></head>
      <body className="min-h-full"><div className="noise" />{children}<Toaster richColors position="top-right" /></body>
    </html>
  );
}
