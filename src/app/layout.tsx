import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-provider';

export const metadata: Metadata = {
  title: 'SiteForge | AI Website Builder',
  description: 'Evidence-backed, verified working, zero lock-in AI website builder.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-md-surface-low text-md-on-surface min-h-screen font-sans antialiased selection:bg-md-primary-container selection:text-md-on-primary-container">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
