'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthContext();

  // Берём имя из email (до @)
  const displayName = user?.email?.split('@')[0] || 'Пользователь';

  return (
    <header className="bg-white">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-0 py-4 flex items-center justify-between">
        <div className="flex-col items-center gap-3">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="SkyFitnessPro"
              width={180}
              height={35}
              priority
            />
          </Link>
          <span className="text-sm text-gray-600 hidden sm:block">
            Онлайн-тренировки для занятий дома
          </span>
        </div>

        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full">
                  <Image
                    src="/miniProfil.png"
                    alt="Аватар"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium hidden md:block">
                  {displayName}
                </span>
              </div>

              <Link
                href="/profile"
                className="text-gray-700 hover:text-black font-medium"
              >
                Профиль
              </Link>

              <button
                onClick={logout}
                className="px-5 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition"
              >
                Выйти
              </button>
            </>
          ) : (
            <Link href="/login">
              <button className="px-6 py-2 bg-[#BCEC30] text-black rounded-full hover:bg-[#a3d32a] transition font-medium">
                Войти
              </button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
