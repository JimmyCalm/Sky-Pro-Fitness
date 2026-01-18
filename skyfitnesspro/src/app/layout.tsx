import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Sky Fitness Pro',
  description: 'Онлайн-тренировки для занятий дома',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ru">
      <body className="container mx-auto  max-w-[1160px]">
        <AuthProvider>
        <Header />
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}