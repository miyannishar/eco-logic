import "./globals.css";
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata = {
  title: 'ECo-logic',
  description: 'AI-powered food analysis and eco-friendly alternatives',
};

// Separate viewport configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
