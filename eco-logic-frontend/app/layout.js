import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";
import Link from "next/link";
import Script from 'next/script';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata = {
  title: 'ECo-nnect',
  description: 'AI-powered campus navigation for Fisk University',
};

// Separate viewport configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ThemeProvider>
          <ErrorBoundary>
            <ThemeToggle />
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
