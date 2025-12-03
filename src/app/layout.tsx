import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: "Ascension - Daily Progress Tracker",
  description: "Track your journey to success with DSA, AI/ML, Gym, and Career goals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AppProvider>
            {children}
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
