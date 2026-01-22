'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { Course, Workout, CourseProgress, WorkoutProgress } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';

const courseFetcher = (url: string) => api.get(url).then((res) => res.data);
const workoutsFetcher = (url: string) =>
  api
    .get(url)
    .then((res) => res.data)
    .catch(() => []);
const progressFetcher = (courseId: string) =>
  api
    .get(`/users/me/progress?courseId=${courseId}`)
    .then((res) => res.data)
    .catch(() => null);

export function useCourseDetail(courseId: string) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const {
    data: course,
    error: courseError,
    isLoading: courseLoading,
  } = useSWR<Course>(`/courses/${courseId}`, courseFetcher, {
    revalidateOnFocus: false,
  });

  const {
    data: workouts,
    error: workoutsError,
    isLoading: workoutsLoading,
  } = useSWR<Workout[]>(
    course ? `/courses/${courseId}/workouts` : null,
    workoutsFetcher,
    { revalidateOnFocus: false }
  );

  // Прогресс запрашиваем ТОЛЬКО если токен есть
  const {
    data: progress,
    error: progressError,
    isLoading: progressLoading,
    mutate: mutateProgress,
  } = useSWR<CourseProgress | null>(
    token ? `/users/me/progress?courseId=${courseId}` : null,
    () => progressFetcher(courseId),
    { revalidateOnFocus: false }
  );

  const completedWorkouts =
    progress?.workoutsProgress?.filter(
      (w: WorkoutProgress) => w.workoutCompleted
    ).length ?? 0;
  const totalWorkouts = workouts?.length || course?.workouts?.length || 0;
  const progressPercent =
    totalWorkouts > 0
      ? Math.round((completedWorkouts / totalWorkouts) * 100)
      : 0;

  const isLoading =
    courseLoading || workoutsLoading || (token ? progressLoading : false);

  // Только ошибки курса считаются критичными
  const error = courseError ? getErrorMessage(courseError) : null;

  return {
    course,
    workouts: workouts ?? [],
    progress,
    progressPercent,
    completedWorkouts,
    totalWorkouts,
    isLoading,
    error,
    mutateProgress,
  };
}
