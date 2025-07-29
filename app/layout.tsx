import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared";
import { AuthProvider } from "@/contexts/auth-context";
import { ErrorBoundary } from "@/components/error";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CanonCore",
  description: "Content organisation platform for expanded universes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary level="page">
          <Providers>
            <AuthProvider>
              {children}
            </AuthProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
