import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-primary text-secondary py-[50px] px-0">
      <div className="container mx-auto max-w-[1160px] flex items-center justify-between">
        {/* Левый блок с лого и заголовком */}
        <div className="flex flex-col">
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={220} height={35} />
          </Link>
          <h4 className="mt-[15px] text-lg font-normal">
            Онлайн-тренировки для занятий дома
          </h4>
        </div>

        {/* Правый блок с навигацией */}
        <nav>
          <ul className="flex space-x-4">
            <li>
              <button className="bg-[#BCEC30] text-primary px-6 py-3 rounded-[46px] hover:opacity-90 transition-opacity">
                Войти
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
