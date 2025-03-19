import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { GameProvider } from '@/hooks/useGameContext';

// Initialize font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Family Gacha THR App',
  description: 'An interactive app for family THR events with games and rewards',
  keywords: ['family', 'gacha', 'thr', 'games', 'rewards', 'events'],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <GameProvider>
              <div className="flex flex-col min-h-screen">
                <header>
                  <Navbar />
                </header>
                <main className="flex-grow pt-16">{children}</main>
                <Footer />
              </div>
            </GameProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
