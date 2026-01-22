'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { User } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

export default function HomePage() {
  const { courses, isLoading, error } = useCourses();
  const { isAuthenticated } = useAuthContext();

  const courseImageMap: Record<string, string> = {
    Йога: '/yoga.png',
    Стретчинг: '/stretching.png',
    Фитнес: '/fitness.png',
    'Степ-аэробика': '/step-aerobics.png',
    Бодифлекс: '/bodyflex.png',
    // английские названия на случай, если в данных они будут на английском
    Yoga: '/yoga.png',
    Stretching: '/stretching.png',
    Fitness: '/fitness.png',
  };

  const difficultyIconMap: Record<string, string> = {
    начальный: '/difficulty-easy.svg',
    лёгкий: '/difficulty-easy.svg',
    средний: '/difficulty-medium.svg',
    сложный: '/difficulty-hard.svg',
    тяжёлый: '/difficulty-hard.svg',
  };

  // Проверяем токен перед запросом /users/me
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { mutate: mutateUser } = useSWR<User>(
    token ? '/users/me' : null,
    () => api.get('/users/me').then((res) => res.data.user ?? res.data),
    { revalidateOnFocus: false }
  );

  const [addingCourseId, setAddingCourseId] = useState<string | null>(null);

  const handleSelectCourse = async (courseId: string) => {
    if (!isAuthenticated) {
      toast.error('Войдите в аккаунт, чтобы выбрать курс');
      return;
    }

    setAddingCourseId(courseId);

    try {
      await api.post('/users/me/courses', { courseId });
      mutateUser?.();
      toast.success('Курс успешно добавлен!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingCourseId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xl">Загрузка курсов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-600">
        <p>Ошибка загрузки курсов: {error}</p>
      </div>
    );
  }

  return (
    <main className="py-12 px-4">
      {/* Заголовок + баннер-облачко */}
      <div className="mb-12 md:mb-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900">
          Начните заниматься спортом
          <br className="hidden sm:block" />и улучшите качество жизни
        </h1>

        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
          <Image
            src="/banner.png"
            alt="Измени своё тело за полгода!"
            width={400}
            height={150}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>

      {/* Сетка курсов */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {courses.map((course) => {
          const imageSrc =
            courseImageMap[course.nameRU] || '/placeholder-course.png';

          const minMin = course.dailyDurationInMinutes?.from ?? 20;
          const maxMin = course.dailyDurationInMinutes?.to ?? 50;
          const days = course.durationInDays ?? 25;

          // Определяем уровень сложности вручную (можно потом заменить на course.difficulty)
          let difficultyLevel: 'easy' | 'medium' | 'hard' = 'medium';
          const nameLower = (course.nameRU || '').toLowerCase();

          if (
            nameLower.includes('йога') ||
            nameLower.includes('стретчинг') ||
            nameLower.includes('йога')
          ) {
            difficultyLevel = 'easy';
          } else if (
            nameLower.includes('степ') ||
            nameLower.includes('фитнес') ||
            nameLower.includes('аэробика')
          ) {
            difficultyLevel = 'medium';
          } else if (
            nameLower.includes('бодифлекс') ||
            nameLower.includes('bodyflex')
          ) {
            difficultyLevel = 'hard';
          }

          // Цвета для полос
          const difficultyClass =
            difficultyLevel === 'easy'
              ? 'easy-difficulty'
              : difficultyLevel === 'hard'
                ? 'hard-difficulty'
                : 'medium-difficulty';

          return (
            <Link
              key={course._id}
              href={`/courses/${course._id}`}
              className="group block w-full max-w-[360px] mx-auto overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-white flex flex-col"
            >
              {/* Картинка — фиксированная высота 325px */}
              <div className="relative w-full h-[325px] overflow-hidden flex-shrink-0">
                <Image
                  src={imageSrc}
                  alt={course.nameRU || 'Курс'}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 360px"
                  priority={courses.indexOf(course) < 4}
                />

                {/* Плюсик теперь в правом верхнем углу картинки */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectCourse(course._id);
                  }}
                  className="absolute top-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md hover:bg-[#00C1FF] hover:text-white transition-colors"
                  disabled={addingCourseId === course._id}
                >
                  <Image
                    src="/addCourse.svg"
                    alt="Добавить"
                    width={28}
                    height={28}
                    className={
                      addingCourseId === course._id ? 'opacity-60' : ''
                    }
                  />
                </button>
              </div>

              {/* Нижняя информационная панель */}
              <div className="p-5 flex flex-col flex-grow bg-white">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {course.nameRU}
                </h3>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-gray-700 mb-4">
                  <div className="flex items-center gap-2">
                    <Image src="/days.svg" alt="" width={20} height={20} />
                    <span>{days} дней</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Image src="/time.svg" alt="" width={20} height={20} />
                    <span>
                      {minMin}–{maxMin} мин/день
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`difficulty-wrapper ${difficultyClass}`}>
                      <Image
                        src="/difficulty.svg"
                        alt="Сложность"
                        width={100}
                        height={24}
                        className="h-6 w-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Можно добавить индикатор сложности текстом, если хочется */}
                <div className="text-xs text-gray-500 mt-auto">
                  {difficultyLevel === 'easy'
                    ? 'Начальный'
                    : difficultyLevel === 'hard'
                      ? 'Сложный'
                      : 'Средний'}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Кнопка наверх */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#00C1FF] text-white text-2xl shadow-xl hover:bg-[#0099d9] transition-colors"
      >
        ↑
      </button>

      {courses.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 text-xl mt-16">
          Курсы пока отсутствуют
        </p>
      )}
    </main>
  );
}
