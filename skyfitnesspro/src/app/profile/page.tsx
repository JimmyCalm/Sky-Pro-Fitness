'use client';

import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSelectedCourses } from '@/hooks/useSelectedCourses';
import { useProgress } from '@/hooks/useProgress';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProgressBar from '@/components/ProgressBar';
import DeleteCourseModal from '@/components/DeleteCourseModal';
import Link from 'next/link';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user: authUser, isLoading: authLoading } = useAuthContext();
  const { selectedCourses, isLoading: coursesLoading, error: coursesError, mutateUser } = useSelectedCourses();
  const { courseProgress, isLoading: progressLoading, error: progressError, mutateProgress } = useProgress();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; name: string } | null>(null);

  const isLoading = authLoading || coursesLoading || progressLoading;
  const error = coursesError || progressError;

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      await api.delete(`/users/me/courses/${courseToDelete.id}`);
      await mutateUser(); // обновляем список курсов
      await mutateProgress(); // обновляем прогресс (если нужно)
      toast.success('Курс успешно удалён!');
    } catch (err) {
      toast.error(`Ошибка удаления: ${getErrorMessage(err)}`);
    } finally {
      setCourseToDelete(null);
      setDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-xl text-gray-600">Загрузка профиля...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-red-600 gap-4">
        <p>Ошибка загрузки данных: {error}</p>
        <button
          onClick={() => mutateUser()}
          className="px-6 py-2 bg-[#00C1FF] text-white rounded-full hover:bg-[#00A1E0]"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  const displayUser = authUser;

  return (
    <ProtectedRoute>
      <main className="py-10 px-4 max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Личный кабинет</h1>
          <p className="text-lg text-gray-600">
            Добро пожаловать, <span className="font-medium">{displayUser?.email || 'пользователь'}</span>!
          </p>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Мои курсы</h2>

          {selectedCourses.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
              <p className="text-xl text-gray-600 mb-6">У вас пока нет выбранных курсов</p>
              <Link
                href="/"
                className="inline-block bg-[#00C1FF] text-white px-8 py-3 rounded-full font-medium hover:bg-[#00A1E0] transition-colors"
              >
                Посмотреть доступные курсы
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCourses.map(course => {
                const courseProg = courseProgress.find(cp => cp.courseId === course._id);
                const completed = courseProg?.workoutsProgress?.filter(wp => wp.workoutCompleted).length ?? 0;
                const total = course.workouts?.length ?? 0;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <div
                    key={course._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                  >
                    <div className="p-6 flex-grow">
                      <h3 className="text-xl font-bold mb-3">
                        {course.nameRU || course.nameEN || 'Без названия'}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {course.description || 'Описание отсутствует'}
                      </p>

                      {course.directions?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {course.directions.map((dir, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-[#00C1FF]/20 text-[#00C1FF] text-xs rounded-full"
                            >
                              {dir}
                            </span>
                          ))}
                        </div>
                      )}

                      <ProgressBar
                        current={completed}
                        total={total}
                        percentage={percent}
                        showLabel={true}
                        height="md"
                      />
                    </div>

                    <div className="px-6 pb-6 mt-auto flex gap-3">
                      <Link
                        href={`/courses/${course._id}`}
                        className="flex-1 text-center py-3 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors font-medium"
                      >
                        Перейти к курсу
                      </Link>

                      <button
                        onClick={() => {
                          setCourseToDelete({
                            id: course._id,
                            name: course.nameRU || course.nameEN || 'Курс',
                          });
                          setDeleteModalOpen(true);
                        }}
                        className="px-4 py-3 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors font-medium"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Модалка подтверждения удаления */}
        {courseToDelete && (
          <DeleteCourseModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setCourseToDelete(null);
            }}
            onConfirm={handleDeleteCourse}
            courseName={courseToDelete.name}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}