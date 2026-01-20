'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useCourseDetail } from '@/hooks/useCourseDetail';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WorkoutProgress } from '@/lib/types';

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

  const { isLoading: authLoading } = useAuthContext();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-xl text-gray-600">Загрузка курса...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-red-600 gap-4">
        <p>Ошибка: {error || 'Курс не найден'}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-lime text-primary rounded-full hover:bg-lime/90"
        >
          Назад
        </button>
      </div>
    );
  }

  const firstWorkoutId = workouts[0]?._id || course.workouts?.[0];

  return (
    <ProtectedRoute>
      <main className="py-10 px-4 max-w-5xl mx-auto">
        <Link
          href="/profile"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Назад к профилю
        </Link>

        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {course.nameRU || course.nameEN}
          </h1>

          <p className="text-gray-700 mb-6">{course.description}</p>

          <div className="flex flex-wrap gap-3 mb-6">
            {course.directions?.map((dir, i) => (
              <span
                key={i}
                className="px-4 py-1 bg-lime/30 text-lime-800 rounded-full text-sm"
              >
                {dir}
              </span>
            ))}
            {course.fitting?.map((fit, i) => (
              <span
                key={i}
                className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {fit}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {course.difficulty && (
              <div>
                <span className="text-sm text-gray-500">Сложность</span>
                <p className="font-medium">{course.difficulty}</p>
              </div>
            )}
            {course.durationInDays && (
              <div>
                <span className="text-sm text-gray-500">Длительность</span>
                <p className="font-medium">{course.durationInDays} дней</p>
              </div>
            )}
            {course.dailyDurationInMinutes && (
              <div>
                <span className="text-sm text-gray-500">В день</span>
                <p className="font-medium">
                  {course.dailyDurationInMinutes.from}–
                  {course.dailyDurationInMinutes.to} мин
                </p>
              </div>
            )}
          </div>

          {/* Прогресс курса */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Прогресс курса</span>
              <span>
                {completedWorkouts}/{totalWorkouts} тренировок •{' '}
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-lime h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={() =>
              firstWorkoutId && router.push(`/workouts/${firstWorkoutId}`)
            }
            disabled={!firstWorkoutId}
            className={cn(
              'w-full md:w-auto px-10 py-4 rounded-full font-medium text-lg',
              firstWorkoutId
                ? 'bg-lime hover:bg-lime/90 text-primary'
                : 'bg-gray-300 cursor-not-allowed text-gray-600'
            )}
          >
            {completedWorkouts > 0 ? 'Продолжить' : 'Начать курс'}
          </button>
        </div>

        {/* Список тренировок */}
        <h2 className="text-2xl font-semibold mb-6">Тренировки в курсе</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workouts.map((workout) => {
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
                  href={`/workouts/${workout._id}?courseId=${course._id}`}
                  className="inline-block px-6 py-2 bg-primary border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {isCompleted ? 'Повторить' : 'Начать'} тренировку
                </Link>
              </div>
            );
          })}
        </div>

        {workouts.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            Тренировки пока не загружены
          </p>
        )}
      </main>
    </ProtectedRoute>
  );
}
