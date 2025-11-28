import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { AssessmentProvider } from '@/contexts/AssessmentContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SIM95 - Sovereign Identity Matrix',
  description: 'Comprehensive psychometric assessment platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AssessmentProvider>
            {children}
          </AssessmentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
