'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useWorkoutDetail } from '@/hooks/useWorkoutDetail';
import ProtectedRoute from '@/components/ProtectedRoute';
import ReactPlayer from 'react-player';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function WorkoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const workoutId = params.id as string;
  const courseId = searchParams.get('courseId') ?? undefined;

  const { workout, progress, isLoading, error, updateProgress } =
    useWorkoutDetail(workoutId, courseId);

  const [localProgressData, setLocalProgressData] = useState<number[]>(
    progress?.progressData ?? workout?.exercises.map(() => 0) ?? []
  );

  const [videoWatched, setVideoWatched] = useState(false);

  const isCompleted = progress?.workoutCompleted ?? false;
  const hasExercises = workout?.exercises && workout.exercises.length > 0;

  // Обработчик изменения прогресса одного упражнения
  const handleUpdateExercise = (index: number, value: number) => {
    setLocalProgressData((prev) => {
      const newData = [...prev];
      newData[index] = Math.max(
        0,
        Math.min(value, workout?.exercises[index]?.quantity ?? 0)
      );
      return newData;
    });
  };

  // Обработчик при завершении видео
  const handleVideoEnded = () => {
    setVideoWatched(true);
  };

  // Завершение тренировки
  const handleCompleteWorkout = async () => {
    if (!courseId) {
      alert('Не удалось определить курс...');
      return;
    }

    // Если нет упражнений, отправляем пустой массив, иначе - данные упражнений
    const progressData = hasExercises ? localProgressData : [];
    const success = await updateProgress(progressData);

    if (success) {
      alert('Тренировка завершена!');
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-xl text-gray-600">Загрузка тренировки...</p>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-red-600 gap-6">
        <p className="text-xl">Ошибка: {error || 'Тренировка не найдена'}</p>
        <button
          onClick={() => router.back()}
          className="px-8 py-3 bg-lime text-primary rounded-full hover:bg-lime/90 font-medium"
        >
          Назад
        </button>
      </div>
    );
  }

  // Проверяем, что courseId передан
  if (!courseId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-amber-700 gap-6">
        <p className="text-xl">Не указан ID курса</p>
        <p className="text-gray-600 max-w-md text-center">
          Пожалуйста, переходите на страницу тренировки из страницы курса — там
          автоматически добавляется courseId в URL.
        </p>
        <button
          onClick={() => router.back()}
          className="px-8 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 font-medium"
        >
          Назад
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="py-10 px-4 max-w-5xl mx-auto">
        {/* Кнопка назад */}
        <button
          onClick={() => router.back()}
          className="mb-8 text-blue-600 hover:underline flex items-center gap-2 font-medium"
        >
          ← Назад к курсу
        </button>

        {/* Заголовок тренировки */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{workout.name}</h1>

        {/* Видео */}
        {workout.video && (
          <div className="aspect-video mb-10 rounded-xl overflow-hidden shadow-lg bg-black">
            <ReactPlayer
              src={workout.video}
              width="100%"
              height="100%"
              controls
              playing={false}
              pip
              light={true}
              onEnded={handleVideoEnded}
            />
          </div>
        )}

        {/* Сообщение после просмотра видео (если нет упражнений) */}
        {videoWatched && !hasExercises && (
          <div className="mb-8 p-4 bg-green-100 border border-green-400 rounded-lg text-green-800">
            <p className="font-medium">
              ✓ Видео просмотрено! Вы можете завершить тренировку.
            </p>
          </div>
        )}

        {/* Список упражнений */}
        {hasExercises && (
          <>
            <h2 className="text-2xl font-semibold mb-6">Упражнения</h2>

            <div className="space-y-6">
              {workout.exercises.map((exercise, index) => {
                const currentReps = localProgressData[index] ?? 0;
                const target = exercise.quantity;

                return (
                  <div
                    key={exercise._id || index}
                    className="bg-white p-6 rounded-xl shadow border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-medium">{exercise.name}</h3>
                      <span className="px-4 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {target} повторений
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentReps >= target}
                          onChange={(e) => {
                            handleUpdateExercise(
                              index,
                              e.target.checked ? target : 0
                            );
                          }}
                          className="w-5 h-5 accent-lime-500"
                        />
                        <span className="text-gray-700">
                          Выполнено полностью
                        </span>
                      </label>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleUpdateExercise(index, currentReps - 1)
                          }
                          disabled={currentReps <= 0}
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold',
                            currentReps <= 0
                              ? 'bg-gray-200 text-gray-400'
                              : 'bg-gray-200 hover:bg-gray-300'
                          )}
                        >
                          -
                        </button>

                        <span className="w-16 text-center text-xl font-medium">
                          {currentReps} / {target}
                        </span>

                        <button
                          onClick={() =>
                            handleUpdateExercise(index, currentReps + 1)
                          }
                          disabled={currentReps >= target}
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold',
                            currentReps >= target
                              ? 'bg-gray-200 text-gray-400'
                              : 'bg-gray-200 hover:bg-gray-300'
                          )}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Кнопка завершения тренировки */}
        <div className="mt-12 text-center">
          <button
            onClick={handleCompleteWorkout}
            disabled={
              isCompleted ||
              (!hasExercises
                ? !videoWatched
                : localProgressData.every((v) => v === 0))
            }
            className={cn(
              'px-12 py-5 rounded-full text-lg font-semibold transition-all shadow-md',
              isCompleted
                ? 'bg-green-600 text-white cursor-not-allowed'
                : (
                      !hasExercises
                        ? !videoWatched
                        : localProgressData.every((v) => v === 0)
                    )
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-lime hover:bg-lime/90 text-primary active:bg-lime/80'
            )}
          >
            {isCompleted
              ? 'Тренировка уже завершена'
              : hasExercises
                ? 'Завершить тренировку'
                : videoWatched
                  ? 'Завершить тренировку'
                  : 'Посмотрите видео до конца'}
          </button>

          {isCompleted && (
            <p className="mt-4 text-green-700 font-medium">
              Поздравляем! Тренировка отмечена как завершённая.
            </p>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
