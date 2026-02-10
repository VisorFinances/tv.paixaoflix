import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PaixãoFlix Pro Max - Streaming Multiplataforma',
  description: 'Sua central de entretenimento definitiva com filmes, séries e conteúdo infantil para todas as plataformas',
  keywords: ['streaming', 'filmes', 'séries', 'tv', 'mobile', 'web', 'pwa', 'multiplataforma'],
  authors: [{ name: 'PaixãoFlix Team' }],
  creator: 'PaixãoFlix',
  publisher: 'PaixãoFlix',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://paixaoflix.com'),
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/pt-BR',
      'en-US': '/en-US',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    title: 'PaixãoFlix Pro Max - Streaming Multiplataforma',
    description: 'Sua central de entretenimento definitiva com filmes, séries e conteúdo infantil',
    siteName: 'PaixãoFlix',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PaixãoFlix Pro Max',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PaixãoFlix Pro Max',
    description: 'Sua central de entretenimento definitiva',
    images: ['/twitter-image.png'],
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
    <html lang="pt-BR" className="scroll-smooth">
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  );
}
