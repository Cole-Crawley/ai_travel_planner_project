import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { AuroraBackground } from '@/components/ui/aurora-background';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'BaconAI — AI Travel Planner',
  description: 'Generate personalised, geographically coherent travel itineraries powered by AI. Plan your trip, explore on a map, and swap activities in real time.',
  keywords: ['travel planner', 'AI itinerary', 'trip planning', 'travel app'],
  openGraph: {
    title: 'BaconAI — AI Travel Planner',
    description: 'Generate personalised travel itineraries powered by AI.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F5F0E8',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuroraBackground showRadialGradient={true}>
          {children}
        </AuroraBackground>
      </body>
    </html>
  );
}