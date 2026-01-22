'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { CourseProgress } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { useSelectedCourses } from './useSelectedCourses';

const progressFetcher = (courseIds: string[]) => {
  if (courseIds.length === 0) return Promise.resolve([]);

  return Promise.all(
    courseIds.map(
      (courseId) =>
        api
          .get(`/users/me/progress?courseId=${courseId}`)
          .then((res) => res.data)
          .catch(() => null) // ошибки по отдельным курсам не ломают всё
    )
  );
};

export function useProgress() {
  const { selectedCourses } = useSelectedCourses();
  const courseIds = selectedCourses.map((course) => course._id);

  // Проверяем наличие токена — если гостя, НЕ делаем запрос прогресса
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const {
    data: rawCourseProgress = [],
    error,
    isLoading,
    mutate,
  } = useSWR<CourseProgress[]>(
    token && courseIds.length > 0 ? ['progress', courseIds] : null, // ← ключ зависит от токена и курсов
    () => progressFetcher(courseIds),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  // Фильтруем null'ы
  const courseProgress = rawCourseProgress.filter(Boolean) as CourseProgress[];

  return {
    courseProgress,
    isLoading,
    error: error ? getErrorMessage(error) : null,
    mutateProgress: mutate,
  };
}
