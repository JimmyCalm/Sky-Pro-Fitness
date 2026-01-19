'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useState } from 'react';

export default function HomePage() {
  const { courses, isLoading, error } = useCourses();
  const { isAuthenticated } = useAuthContext();
  const [addingCourseId, setAddingCourseId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const handleSelectCourse = async (courseId: string) => {
    if (!isAuthenticated) {
      // Можно перенаправить на логин или показать модалку
      alert('Войдите в аккаунт, чтобы выбрать курс');
      return;
    }

    setAddingCourseId(courseId);
    setAddError(null);

    try {
      await api.post('/users/me/courses', JSON.stringify({ courseId }), {
        headers: { 'Content-Type': 'text/plain', }, // здесь json работает
      });
      alert('Курс успешно добавлен в ваш профиль!');
      // Опционально: обновить список курсов или показать уведомление
    } catch (err) {
      setAddError(getErrorMessage(err));
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
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
        Доступные курсы
      </h1>

      {addError && (
        <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {addError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {courses.map(course => (
          <div
            key={course._id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
          >
            <div className="p-6 flex-grow">
              <h3 className="text-xl font-bold mb-3">{course.nameRU || course.nameEN}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {course.directions?.map((dir, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-3 py-1 bg-lime/20 text-lime-800 text-sm rounded-full"
                  >
                    {dir}
                  </span>
                ))}
              </div>

              {course.difficulty && (
                <p className="text-sm text-gray-500">
                  Сложность: <span className="font-medium">{course.difficulty}</span>
                </p>
              )}
            </div>

            <div className="p-6 pt-0 mt-auto">
              <button
                onClick={() => handleSelectCourse(course._id)}
                disabled={addingCourseId === course._id}
                className={cn(
                  "w-full py-3 rounded-full font-medium transition-all",
                  addingCourseId === course._id
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-lime hover:bg-lime/90 active:bg-lime/80 text-primary"
                )}
              >
                {addingCourseId === course._id ? 'Добавляем...' : 'Выбрать курс'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 text-xl mt-12">
          Курсы пока отсутствуют
        </p>
      )}
    </main>
  );
}