'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCourseDetail } from '@/hooks/useCourseDetail';
import { useAuthContext } from '@/contexts/AuthContext';
import ProgressBar from '@/components/ProgressBar';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WorkoutProgress } from '@/lib/types';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils'; // ← добавь импорт

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();

  const {
    course,
    workouts,
    progress,
    progressPercent,
    completedWorkouts,
    totalWorkouts,
    isLoading,
    error,
  } = useCourseDetail(courseId);

  const { isAuthenticated } = useAuthContext();

  // Курс добавлен, если progress загружен
  const isAdded = isAuthenticated && progress !== undefined;

  // Сортируем тренировки по порядку в course.workouts
  const sortedWorkouts = workouts?.slice().sort((a, b) => {
    const indexA = course?.workouts?.indexOf(a._id) ?? Number.MAX_SAFE_INTEGER;
    const indexB = course?.workouts?.indexOf(b._id) ?? Number.MAX_SAFE_INTEGER;
    return indexA - indexB;
  }) ?? [];

  const nextWorkoutId = (() => {
    if (sortedWorkouts.length === 0) return null;

    for (const w of sortedWorkouts) {
      const wp = progress?.workoutsProgress?.find(
        (p: WorkoutProgress) => p.workoutId === w._id
      );
      if (!wp?.workoutCompleted) return w._id;
    }

    return sortedWorkouts[0]?._id ?? null;
  })();

  const handleAddCourse = async () => {
    if (!isAuthenticated) {
      toast.error('Войдите, чтобы добавить курс');
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }

    try {
      await api.post('/users/me/courses', { courseId });
      toast.success('Курс добавлен!');
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Загрузка курса...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600 gap-6 bg-gray-50">
        <p className="text-2xl font-medium">Курс не найден или произошла ошибка</p>
        <Link
          href="/"
          className="px-8 py-3 bg-[#00C1FF] text-white rounded-full hover:bg-[#00A1E0] font-medium"
        >
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-10 px-4 max-w-6xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block font-medium">
          ← На главную
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">
            {course.nameRU || course.nameEN}
          </h1>

          <p className="text-gray-700 mb-8 leading-relaxed">{course.description}</p>

          {/* Теги */}
          <div className="flex flex-wrap gap-3 mb-8">
            {course.directions?.map((dir, i) => (
              <span key={i} className="px-4 py-1 bg-[#00C1FF]/10 text-[#00C1FF] rounded-full text-sm font-medium">
                {dir}
              </span>
            ))}
            {course.fitting?.map((fit, i) => (
              <span key={i} className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {fit}
              </span>
            ))}
          </div>

          {/* Характеристики */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {course.difficulty && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="block text-sm text-gray-500 mb-1">Сложность</span>
                <p className="font-medium text-gray-900">{course.difficulty}</p>
              </div>
            )}
            {course.durationInDays && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="block text-sm text-gray-500 mb-1">Длительность</span>
                <p className="font-medium text-gray-900">{course.durationInDays} дней</p>
              </div>
            )}
            {course.dailyDurationInMinutes && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="block text-sm text-gray-500 mb-1">В день</span>
                <p className="font-medium text-gray-900">
                  {course.dailyDurationInMinutes.from}–{course.dailyDurationInMinutes.to} мин
                </p>
              </div>
            )}
          </div>

          {/* Прогресс — только для авторизованных и добавленных */}
          {isAuthenticated && isAdded && (
            <div className="mb-10 bg-gradient-to-r from-[#00C1FF]/5 to-[#00C1FF]/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-gray-900">Ваш прогресс</h3>
                <span className="text-sm font-medium text-gray-700">
                  {completedWorkouts}/{totalWorkouts} • {progressPercent}%
                </span>
              </div>
              <ProgressBar
                current={completedWorkouts}
                total={totalWorkouts}
                percentage={progressPercent}
                showLabel={false}
                height="lg"
              />
            </div>
          )}

          {/* Кнопка действия */}
          <div className="flex flex-col sm:flex-row gap-4">
            {isAuthenticated ? (
              isAdded ? (
                <button
                  onClick={() => nextWorkoutId && router.push(`/workouts/${nextWorkoutId}?courseId=${courseId}`)}
                  disabled={!nextWorkoutId}
                  className={cn(
                    'flex-1 py-4 rounded-full font-medium text-lg transition-all shadow-md',
                    nextWorkoutId
                      ? 'bg-[#00C1FF] hover:bg-[#00A1E0] text-white active:bg-[#0088CC]'
                      : 'bg-gray-300 cursor-not-allowed text-gray-600'
                  )}
                >
                  {completedWorkouts > 0 ? 'Продолжить курс' : 'Начать курс'}
                </button>
              ) : (
                <button
                  onClick={handleAddCourse}
                  className="flex-1 py-4 rounded-full font-medium text-lg transition-all shadow-md bg-[#00C1FF] hover:bg-[#00A1E0] text-white active:bg-[#0088CC]"
                >
                  Добавить курс
                </button>
              )
            ) : (
              <Link
                href={`/login?redirect=/courses/${courseId}`}
                className="flex-1 py-4 rounded-full font-medium text-lg text-center bg-[#00C1FF] hover:bg-[#00A1E0] text-white transition-all shadow-md"
              >
                Войдите, чтобы добавить курс
              </Link>
            )}
          </div>
        </div>

        {/* Список тренировок */}
        <h2 className="text-2xl font-semibold mb-6">Тренировки в курсе</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedWorkouts.map(workout => {
            const workoutProgress = progress?.workoutsProgress?.find(
              (wp: WorkoutProgress) => wp.workoutId === workout._id
            );
            const isCompleted = workoutProgress?.workoutCompleted || false;

            return (
              <div
                key={workout._id}
                className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold">{workout.name}</h3>
                  {isCompleted && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Завершено
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-4">
                  Упражнений: {workout.exercises?.length || 0}
                </p>

                <Link
                  href={`/workouts/${workout._id}?courseId=${courseId}`}
                  className="inline-block px-6 py-2 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 transition-colors font-medium"
                >
                  {isCompleted ? 'Повторить' : 'Посмотреть тренировку'}
                </Link>
              </div>
            );
          })}
        </div>

        {sortedWorkouts.length === 0 && (
          <p className="text-center text-gray-500 py-10 text-lg">
            Тренировки пока не добавлены в курс
          </p>
        )}
      </main>
    </div>
  );
}