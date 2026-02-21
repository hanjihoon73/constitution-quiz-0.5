import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "모두의 헌법 - 퀴즈로 즐기는 헌법 상식",
  description: "퀴즈를 풀면서 대한민국 헌법을 쉽고 재미있게 배워보세요.",
  keywords: ["헌법", "퀴즈", "교육", "대한민국", "법률"],
  openGraph: {
    title: "모두의 헌법",
    description: "퀴즈로 즐기는 재미있는 헌법 상식",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
