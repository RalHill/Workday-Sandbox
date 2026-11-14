import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workday Sandbox | HRIS Practice Platform",
  description: "Practice configuring Workday objects, business processes, and security in a safe sandbox environment",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header pendingTaskCount={3} />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 overflow-auto bg-muted/30">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
