import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CertForge AI',
  description:
    'CertForge AI - an independently generated certification practice platform. Not affiliated with or endorsed by Anthropic or Pearson VUE.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
