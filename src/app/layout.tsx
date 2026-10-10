import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Agent Website Generator | Senior Architecture Studio',
  description: 'Autonomous AI Agent for generating, editing, and publishing complete production websites.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-black min-h-screen selection:bg-black selection:text-white">
        {children}
      </body>
    </html>
  );
}
