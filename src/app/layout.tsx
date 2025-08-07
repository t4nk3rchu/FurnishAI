import type { Metadata } from 'next';
import './globals.css';
import { WishlistProvider } from '@/contexts/wishlist-context';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'FurnishAI',
  description: 'A modern furniture showroom app for browsing and selecting products.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full">
        <WishlistProvider>
          {children}
          <Toaster />
        </WishlistProvider>
      </body>
    </html>
  );
}
