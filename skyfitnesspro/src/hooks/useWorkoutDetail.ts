'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { Workout, WorkoutProgress } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';

const workoutFetcher = (url: string) => api.get(url).then((res) => res.data);

export function useWorkoutDetail(workoutId: string, courseId?: string) {
  // ← добавили courseId как опциональный параметр
  const {
    data: workout,
    error: workoutError,
    isLoading: workoutLoading,
  } = useSWR<Workout>(`/workouts/${workoutId}`, workoutFetcher, {
    revalidateOnFocus: false,
  });

  // Прогресс по тренировке (требует courseId)
  const progressKey =
    courseId && workoutId
      ? `/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`
      : null;

  const {
    data: progress,
    error: progressError,
    isLoading: progressLoading,
    mutate: mutateProgress,
  } = useSWR<WorkoutProgress | null>(
    progressKey,
    (url) => api.get(url).then((res) => res.data),
    { revalidateOnFocus: false }
  );

  const updateProgress = async (newProgressData: number[]) => {
    if (!courseId) {
      console.error('courseId не передан — нельзя обновить прогресс');
      return false;
    }

    try {
      await api.patch(`/courses/${courseId}/workouts/${workoutId}`, {
        progressData: newProgressData,
      });
      await mutateProgress(); // обновляем прогресс
      return true;
    } catch (err) {
      console.error('Ошибка сохранения прогресса:', getErrorMessage(err));
      return false;
    }
  };

  return {
    workout,
    progress,
    isLoading: workoutLoading || progressLoading,
    error:
      workoutError || progressError
        ? getErrorMessage(workoutError || progressError)
        : null,
    updateProgress,
    mutateProgress,
  };
}
