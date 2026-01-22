'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { User } from '@/lib/types';
import DifficultyIcon from '@/components/DifficultyIcon';
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
    Yoga: '/yoga.png',
    Stretching: '/stretching.png',
    Fitness: '/fitness.png',
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { mutate: mutateUser } = useSWR<User>(
    token ? '/users/me' : null,
    () => api.get('/users/me').then((res) => res.data.user ?? res.data),
    { revalidateOnFocus: false },
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

  if (isLoading) return <div className="min-h-[60vh] grid place-items-center text-xl">Загрузка курсов...</div>;

  if (error) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-red-600">
        Ошибка загрузки курсов: {error}
      </div>
    );
  }

  return (
    <main className="py-12 px-4">
      {/* Заголовок + облачко */}
      <div className="mb-12 md:mb-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900">
          Начните заниматься спортом
          <br className="hidden sm:block" />
          и улучшите качество жизни
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

      {/* Карточки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto justify-items-center">
        {courses.map((course) => {
          const imageSrc = courseImageMap[course.nameRU] || '/placeholder-course.png';
          const days = course.durationInDays ?? 25;
          const min = course.dailyDurationInMinutes?.from ?? 20;
          const max = course.dailyDurationInMinutes?.to ?? 50;

          let level: 'easy' | 'medium' | 'hard' = 'medium';
          const name = (course.nameRU || '').toLowerCase();

          if (name.includes('йога') || name.includes('стретчинг')) level = 'easy';
          else if (name.includes('степ') || name.includes('фитнес') || name.includes('аэробика')) level = 'medium';
          else if (name.includes('бодифлекс')) level = 'hard';

          return (
            <Link
              key={course._id}
              href={`/courses/${course._id}`}
              className="group block w-full max-w-[360px] overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-white flex flex-col"
            >
              {/* Изображение */}
              <div className="relative w-full h-[325px] flex-shrink-0 overflow-hidden">
                <Image
                  src={imageSrc}
                  alt={course.nameRU || 'Курс'}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 360px"
                  priority={courses.indexOf(course) < 4}
                />

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectCourse(course._id);
                  }}
                  className="absolute top-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md hover:bg-[#00C1FF] hover:text-white transition-colors disabled:opacity-50"
                  disabled={addingCourseId === course._id}
                >
                  <Image src="/addCourse.svg" alt="Добавить курс" width={28} height={28} />
                </button>
              </div>

              {/* Информация */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{course.nameRU}</h3>

                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-700 mb-4">
                  <div className="flex items-center gap-2">
                    <Image src="/days.svg" alt="" width={20} height={20} />
                    <span>{days} дней</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Image src="/time.svg" alt="" width={20} height={20} />
                    <span>
                      {min}–{max} мин/день
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DifficultyIcon level={level} width={100} height={24} />
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-auto">
                  {level === 'easy' ? 'Начальный' : level === 'hard' ? 'Сложный' : 'Средний'}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Наверх */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#00C1FF] text-white text-2xl shadow-xl hover:bg-[#0099d9] transition-colors"
      >
        ↑
      </button>

      {courses.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 text-xl mt-16">Курсы пока отсутствуют</p>
      )}
    </main>
  );
}