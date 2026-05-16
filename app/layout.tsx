import type { Metadata, Viewport } from "next";
// @ts-ignore
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import HydrationGuard from "@/components/HydrationGuard";

export const viewport: Viewport = {
  themeColor: "#f43f5e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Love Sunny",
  description: "Your Shared Sunshine, Together.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Love Sunny",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans bg-slate-100 flex justify-center text-slate-900" suppressHydrationWarning>
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col overflow-hidden">
           <HydrationGuard>
             {children}
             <BottomNav />
           </HydrationGuard>
        </div>
      </body>
    </html>
  );
}

