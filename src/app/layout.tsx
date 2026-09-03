import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import 'react-hint/css/index.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Piccy',
  description: 'A tiny pixel art editor that keeps the whole image in the URL.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#282c34',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
