'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { CourseProgress } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { useSelectedCourses } from './useSelectedCourses';

const progressFetcher = (courseIds: string[]) => {
  if (courseIds.length === 0) {
    return Promise.resolve([]);
  }

  // Получаем прогресс для каждого курса параллельно
  return Promise.all(
    courseIds.map((courseId) =>
      api.get(`/users/me/progress?courseId=${courseId}`).then((res) => res.data)
    )
  );
};

export function useProgress() {
  const { selectedCourses } = useSelectedCourses();
  const courseIds = selectedCourses.map((course) => course._id);

  const {
    data: courseProgress = [],
    error,
    isLoading,
  } = useSWR<CourseProgress[]>(
    courseIds.length > 0 ? courseIds : null,
    courseIds.length > 0 ? () => progressFetcher(courseIds) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    courseProgress,
    isLoading,
    error: error ? getErrorMessage(error) : null,
  };
}
