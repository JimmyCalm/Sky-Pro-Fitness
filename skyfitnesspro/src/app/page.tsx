'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useState } from 'react';
import useSWR from 'swr';
import { User } from '@/lib/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const { courses, isLoading, error } = useCourses();
  const { isAuthenticated } = useAuthContext();

  // Проверяем токен перед запросом /users/me
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { mutate: mutateUser } = useSWR<User>(
    token ? '/users/me' : null, // ← только если есть токен
    () =>
      api.get('/users/me').then((res) => {
        const data = res.data;
        return data.user ? data.user : data;
      }),
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
      await mutateUser?.(); // безопасно, если mutateUser существует
      toast.success('Курс успешно добавлен в ваш профиль!');
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
      <div className=" flex mb-10">
        <h1 className="text-[black] md:text-[60px] font-medium text-start mb-10">
        Начните заниматься спортом и улучшите качество жизни
      </h1>
      <Image
          src="/banner.png"
          alt="Баннер"
          width={288}
          height={120}
          className="mt-4 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {courses.map((course) => (
          <Link
            key={course._id}
            href={`/courses/${course._id}`}
            className="group relative block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
          >
            {/* Иконка + в правом верхнем углу */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectCourse(course._id);
                }}
                className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#00C1FF] hover:bg-[#00C1FF] hover:text-white transition"
              >
                <span className="text-2xl font-bold">+</span>
              </button>
            </div>

            <div className="p-6 flex-grow">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                {course.nameRU || course.nameEN}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {course.directions?.map((dir, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-3 py-1 bg-[#00C1FF]/10 text-[#00C1FF] text-sm rounded-full"
                  >
                    {dir}
                  </span>
                ))}
              </div>

              {course.difficulty && (
                <p className="text-sm text-gray-500">
                  Сложность:{' '}
                  <span className="font-medium">{course.difficulty}</span>
                </p>
              )}
            </div>

            <div className="p-6 pt-0 mt-auto">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectCourse(course._id);
                }}
                disabled={addingCourseId === course._id}
                className={cn(
                  'w-full py-3 rounded-full font-medium transition-all shadow-md',
                  addingCourseId === course._id
                    ? 'bg-gray-300 cursor-not-allowed text-gray-700'
                    : 'bg-[#00C1FF] hover:bg-[#00A1E0] text-white'
                )}
              >
                {addingCourseId === course._id
                  ? 'Добавляем...'
                  : 'Выбрать курс'}
              </button>
            </div>
          </Link>
        ))}
      </div>

      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 bg-[#00C1FF] text-white p-4 rounded-full shadow-lg">Наверх ↑</button>

      {courses.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 text-xl mt-12">
          Курсы пока отсутствуют
        </p>
      )}
    </main>
  );
}
