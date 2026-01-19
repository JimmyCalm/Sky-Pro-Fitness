'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { Course } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useCourses() {
  const { data, error, isLoading, mutate } = useSWR<Course[]>('/courses', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 минута кэширования
  });

  return {
    courses: data ?? [],
    isLoading,
    error: error ? getErrorMessage(error) : null,
    mutate, // можно использовать для обновления списка после выбора курса
  };
}