import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FPGA Packet Lab | Research & Build Guide',
  description: 'A source-backed roadmap for a 10GbE FPGA datapath, with module contracts, verification cases, and hardware evidence gates.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
