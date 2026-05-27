import type { Metadata } from 'next';
import { Anton, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { CookieBanner } from '@/components/layout/CookieBanner';
import './globals.css';

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kickoff26 — World Cup 2026 Games',
  description: 'Sweepstake and My Golden Six for the 2026 FIFA World Cup. Play at kickoff26.io',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
