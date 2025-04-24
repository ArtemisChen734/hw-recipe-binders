import './globals.css';

import { GeistSans } from 'geist/font/sans';

import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from 'next-auth/react';

const title = 'Recipe Binders';
const description =
  'recipe-binders';

export const metadata = {
  title,
  description,
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  metadataBase: new URL('https://recipe-binders.vercel.app/'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={GeistSans.variable}>
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
