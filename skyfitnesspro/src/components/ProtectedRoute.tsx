'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
// import LoadingSpinner from '@/components/ui/LoadingSpinner'; // надо подумать как сделать красивый лоадер

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Пока идёт проверка — показываем лоадер (пока ещё в задумке)
  //   if (isLoading) {
  //     return (
  //       <div className="min-h-screen flex items-center justify-center">
  //         <LoadingSpinner />
  //       </div>
  //     );
  //   }

  // Если не авторизован — ничего не рендерим (редирект уже произошёл)
  if (!isAuthenticated) {
    return null;
  }

  // Всё ок — показываем защищённый контент
  return <>{children}</>;
}
