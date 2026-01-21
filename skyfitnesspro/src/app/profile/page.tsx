'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useSelectedCourses } from '@/hooks/useSelectedCourses';
import { useProgress } from '@/hooks/useProgress';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProgressBar from '@/components/ProgressBar';
import Link from 'next/link';

export default function ProfilePage() {
  const { user: authUser, isLoading: authLoading } = useAuthContext();
  const { selectedCourses, isLoading, error, mutateUser } =
    useSelectedCourses();
  const { courseProgress } = useProgress();

  if (authLoading || isLoading) {
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
          className="px-6 py-2 bg-lime text-primary rounded-full hover:bg-lime/90"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  const displayUser = authUser; // можно потом заменить на данные из /users/me

  return (
    <ProtectedRoute>
      <main className="py-10 px-4 max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Личный кабинет
          </h1>
          <p className="text-lg text-gray-600">
            Добро пожаловать,{' '}
            <span className="font-medium">
              {displayUser?.email || 'пользователь'}
            </span>
            !
          </p>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Мои курсы</h2>

          {selectedCourses.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
              <p className="text-xl text-gray-600 mb-6">
                У вас пока нет выбранных курсов
              </p>
              <Link
                href="/"
                className="inline-block bg-lime text-primary px-8 py-3 rounded-full font-medium hover:bg-lime/90 transition-colors"
              >
                Посмотреть доступные курсы
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCourses.map((course) => {
                // Находим прогресс для текущего курса
                const courseProgressData = courseProgress.find(
                  (cp) => cp.courseId === course._id
                );
                const courseCompletedWorkouts =
                  courseProgressData?.workoutsProgress?.filter(
                    (wp) => wp.workoutCompleted
                  ).length || 0;
                const courseTotalWorkouts = course.workouts?.length || 0;
                const courseProgressPercent =
                  courseTotalWorkouts > 0
                    ? Math.round(
                        (courseCompletedWorkouts / courseTotalWorkouts) * 100
                      )
                    : 0;

                return (
                  <div
                    key={course._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                  >
                    <div className="p-6 grow">
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
                              className="px-3 py-1 bg-lime/20 text-lime-800 text-xs rounded-full"
                            >
                              {dir}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Прогресс пока placeholder — добавим позже */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Прогресс</span>
                          <span>{courseProgressPercent}%</span>
                        </div>
                        <ProgressBar
                          current={courseCompletedWorkouts}
                          total={courseTotalWorkouts || 1}
                          percentage={courseProgressPercent}
                          showLabel={false}
                          height="md"
                        />
                      </div>
                    </div>

                    <div className="px-6 pb-6 mt-auto">
                      <Link
                        href={`/courses/${course._id}`}
                        className="block w-full text-center py-3 bg-primary border border-gray-300 rounded-full hover:bg-gray-50 transition-colors font-medium"
                      >
                        Перейти к курсу
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
