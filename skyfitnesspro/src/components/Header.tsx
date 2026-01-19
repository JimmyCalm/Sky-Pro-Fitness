'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function Header() {
  const { isAuthenticated, logout, user } = useAuthContext();

 return (
    <header className="bg-primary text-secondary py-12 px-0">
      <div className="container mx-auto max-w-[1160px] flex items-center justify-between">
        <div className="flex flex-col">
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={220} height={35} />
          </Link>
          <h4 className="mt-4 text-lg font-normal">Онлайн-тренировки для занятий дома</h4>
        </div>
        <nav>
          <ul className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <li className="text-lg">Привет, {user?.email}!</li>
                <li>
                  <Link href="/profile" className="text-lg hover:underline">Профиль</Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="bg-lime text-primary px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
                  >
                    Выйти
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login">
                  <button className="bg-[#BCEC30] text-primary px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
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