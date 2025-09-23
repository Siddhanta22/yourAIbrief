import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { SessionChecker } from '@/components/SessionChecker';
import { Toaster } from 'react-hot-toast';
// Ensure styled-jsx is included in the server bundle on Vercel
// (removed) explicit styled-jsx import; not needed and breaks server build

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Newsletter - Your Daily AI Intelligence',
  description: 'Stay ahead with curated AI news, breakthroughs, and insights delivered to your inbox daily. Personalized content for researchers, developers, and AI enthusiasts.',
  keywords: 'AI, artificial intelligence, machine learning, newsletter, tech news, AI research, deep learning',
  authors: [{ name: 'AI Newsletter Team' }],
  creator: 'AI Newsletter Platform',
  publisher: 'AI Newsletter',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'AI Newsletter - Your Daily AI Intelligence',
    description: 'Stay ahead with curated AI news, breakthroughs, and insights delivered to your inbox daily.',
    url: '/',
    siteName: 'AI Newsletter',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Newsletter',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Newsletter - Your Daily AI Intelligence',
    description: 'Stay ahead with curated AI news, breakthroughs, and insights delivered to your inbox daily.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>
          <SessionChecker />
          <Navigation />
          {children}
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--toast-border)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
} 