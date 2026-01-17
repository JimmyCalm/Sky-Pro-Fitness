import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Sky Fitness Pro',
  description: 'Онлайн-тренировки для занятий дома',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ru">
      <body className="container mx-auto  max-w-290">
        <Header />
        {children}
      </body>
    </html>
  );
}