'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelectedCourses } from '@/hooks/useSelectedCourses';
import { useProgress } from '@/hooks/useProgress';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

export default function ProfilePage() {
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
  const { user, logout, isAuthenticated } = useAuthContext();
  const router = useRouter();

  const { selectedCourses, mutateUser } = useSelectedCourses();
  const { courseProgress } = useProgress();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Вы вышли из аккаунта');
      router.push('/');
    } catch (err) {
      toast.error('Ошибка выхода');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Удалить курс? Прогресс тоже пропадёт.')) return;

    try {
      await api.delete(`/users/me/courses/${courseId}`);
      mutateUser();
      toast.success('Курс удалён');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок и пользователь */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Личный кабинет</h1>
              <p className="text-lg text-gray-600 mt-2">
                Добро пожаловать,{' '}
                <span className="font-medium">{user?.email}</span>!
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden">
                <Image
                  src="/avatar-placeholder.png" // добавь свою аватарку или используй user?.avatar
                  alt="Аватар"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-lg">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-sm text-gray-500">Логин: {user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-4 px-6 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
              >
                Выйти
              </button>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Мои курсы</h2>

            {selectedCourses.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                <p className="text-xl text-gray-600 mb-6">
                  У вас пока нет выбранных курсов
                </p>
                <Link
                  href="/"
                  className="inline-block bg-[#00C1FF] text-white px-8 py-3 rounded-full font-medium hover:bg-[#00A1E0] transition-colors"
                >
                  Посмотреть доступные курсы
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCourses.map((course) => {
                  const imageSrc =
                    courseImageMap[course.nameRU] ||
                    courseImageMap[course.nameEN] ||
                    '/placeholder-course.png';

                  const prog = courseProgress.find(
                    (p) => p.courseId === course._id
                  );
                  const completed =
                    prog?.workoutsProgress?.filter((w) => w.workoutCompleted)
                      .length ?? 0;
                  const total = course.workouts?.length ?? 0;
                  const percent =
                    total > 0 ? Math.round((completed / total) * 100) : 0;

                  let buttonText = 'Начать тренировки';
                  let buttonClass =
                    'bg-green-500 hover:bg-green-600 text-white';
                  if (percent === 100) {
                    buttonText = 'Начать заново';
                    buttonClass = 'bg-amber-500 hover:bg-amber-600 text-white';
                  } else if (completed > 0) {
                    buttonText = 'Продолжить';
                    buttonClass = 'bg-blue-500 hover:bg-blue-600 text-white';
                  }

                  return (
                    <div
                      key={course._id}
                      className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      {/* Картинка */}
                      <div className="relative h-48 md:h-56">
                        <Image
                          src={imageSrc}
                          alt={course.nameRU}
                          fill
                          className="object-cover"
                        />

                        {/* Крестик удаления при наведении */}
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Удалить курс"
                        >
                          ×
                        </button>
                      </div>

                      {/* Информация */}
                      <div className="p-5">
                        <h3 className="text-xl font-bold mb-3">
                          {course.nameRU}
                        </h3>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {course.durationInDays ?? 25} дней
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {course.dailyDurationInMinutes?.from ?? 20}–
                            {course.dailyDurationInMinutes?.to ?? 50} мин/день
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {course.difficulty || 'Средняя'}
                          </span>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Прогресс {percent}%</span>
                            <span>
                              {completed}/{total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-[#00C1FF] h-2.5 rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        <Link
                          href={`/courses/${course._id}`}
                          className={`block text-center py-3 rounded-full font-medium transition-colors ${buttonClass}`}
                        >
                          {buttonText}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
