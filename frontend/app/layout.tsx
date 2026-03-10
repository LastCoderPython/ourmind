import type { Metadata } from 'next';
import './globals.css'; // Global styles
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Manas',
  description: 'Watch your emotional wellness grow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
