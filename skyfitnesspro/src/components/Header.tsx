// components/Header.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';

export default function Header() {
  const { isAuthenticated, logout, user } = useAuthContext();

  return (
    <header className="bg-primary text-secondary py-10 md:py-12">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col">
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={220} height={35} priority />
          </Link>
          <h4 className="mt-3 md:mt-4 text-base md:text-lg font-normal">
            Онлайн-тренировки для занятий дома
          </h4>
        </div>

        <nav>
          <ul className="flex items-center gap-4 md:gap-6">
            {isAuthenticated ? (
              <>
                <li className="text-base md:text-lg hidden sm:block">
                  Привет, {user?.email?.split('@')[0]}!
                </li>
                <li>
                  <Link href="/profile" className="text-base md:text-lg hover:underline">
                    Профиль
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="bg-lime text-primary px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base hover:opacity-90 transition-opacity"
                  >
                    Выйти
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login">
                  <button className="bg-[#BCEC30] text-primary px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base hover:opacity-90 transition-opacity">
                    Войти
                  </button>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}