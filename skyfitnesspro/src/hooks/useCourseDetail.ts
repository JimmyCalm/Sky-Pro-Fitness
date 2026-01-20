'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { Course, Workout, WorkoutProgress } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';

const courseFetcher = (url: string) => api.get(url).then(res => res.data);
const workoutsFetcher = (url: string) => api.get(url).then(res => res.data);
const progressFetcher = (courseId: string) => 
  api.get(`/users/me/progress?courseId=${courseId}`).then(res => res.data);

export function useCourseDetail(courseId: string) {
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
  } = useSWR<Workout[]>(course ? `/courses/${courseId}/workouts` : null, workoutsFetcher, {
    revalidateOnFocus: false,
  });

  const {
    data: progress,
    error: progressError,
    isLoading: progressLoading,
    mutate: mutateProgress,
  } = useSWR(courseId ? `/users/me/progress?courseId=${courseId}` : null, 
    () => progressFetcher(courseId), {
      revalidateOnFocus: false,
    });

  const completedWorkouts =
  progress?.workoutsProgress?.filter((w: WorkoutProgress) => w.workoutCompleted).length ?? 0;
  const totalWorkouts = workouts?.length || course?.workouts?.length || 0;
  const progressPercent = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

  return {
    course,
    workouts: workouts ?? [],
    progress,
    progressPercent,
    completedWorkouts,
    totalWorkouts,
    isLoading: courseLoading || workoutsLoading || progressLoading,
    error: courseError || workoutsError || progressError 
      ? getErrorMessage(courseError || workoutsError || progressError) 
      : null,
    mutateProgress,
  };
}