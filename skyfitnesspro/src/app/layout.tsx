// app/layout.tsx
import { Toaster } from 'react-hot-toast';
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Sky Fitness Pro',
  description: 'Онлайн-тренировки для занятий дома',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <AuthProvider>
          <div className="mx-auto w-full max-w-[1160px]">
            <Header />
            <main className="px-4 sm:px-6 lg:px-0">{children}</main>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff',
                },
                success: { style: { background: '#10B981', color: 'white' } },
                error:   { style: { background: '#EF4444', color: 'white' } },
              }}
            />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}