'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { CourseProgress } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { useSelectedCourses } from './useSelectedCourses';

const progressFetcher = (courseIds: string[]) => {
  if (courseIds.length === 0) return Promise.resolve([]);

  return Promise.all(
    courseIds.map(courseId =>
      api
        .get(`/users/me/progress?courseId=${courseId}`)
        .then(res => res.data)
        .catch(() => null) // если ошибка по одному курсу — не ломаем весь запрос
    )
  );
};

export function useProgress() {
  const { selectedCourses } = useSelectedCourses();
  const courseIds = selectedCourses.map(course => course._id);

  const {
    data: rawCourseProgress = [],
    error,
    isLoading,
    mutate,
  } = useSWR<CourseProgress[]>(
    courseIds.length > 0 ? ['progress', courseIds] : null, // ключ зависит от courseIds
    () => progressFetcher(courseIds),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  // Фильтруем null'ы (ошибки по отдельным курсам)
  const courseProgress = rawCourseProgress.filter(Boolean) as CourseProgress[];

  return {
    courseProgress,
    isLoading,
    error: error ? getErrorMessage(error) : null,
    mutateProgress: mutate,
  };
}