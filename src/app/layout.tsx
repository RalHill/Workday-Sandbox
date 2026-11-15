import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { WorkdayHeader } from "@/components/layout/workday-header";
import { ClientOverlays } from "@/components/layout/client-overlays";

// Workday Canvas uses Roboto as its primary typeface
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

// Roboto Mono for tabular figures and code
const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Workday",
  description: "Workday HCM Practice Sandbox - Authentic analyst training environment",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} ${robotoMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#F7F7F7]">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <WorkdayHeader />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
          <ClientOverlays />
        </Providers>
      </body>
    </html>
  );
}
