import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Job Tracker',
  description: 'Track your job applications from wishlist to offer.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <Providers>
          <header className="border-b border-slate-200 dark:border-slate-800">
            <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
              <Link href="/" className="text-lg font-semibold">
                Job Tracker
              </Link>
            </nav>
          </header>
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
