'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { Course, User } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';

const coursesFetcher = () => api.get('/courses').then(res => res.data);
const userFetcher = () => api.get('/users/me').then(res => res.data);

export function useSelectedCourses() {
  const {
    data: allCourses,
    error: coursesError,
    isLoading: coursesLoading,
  } = useSWR<Course[]>('/courses', coursesFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const {
    data: user,
    error: userError,
    isLoading: userLoading,
    mutate: mutateUser,           // ← этот mutate уже "привязан" к /users/me
  } = useSWR<User>('/users/me', userFetcher, {
    revalidateOnFocus: false,
  });

  const selectedCoursesData = user?.selectedCourses
    ?.map(id => allCourses?.find(course => course._id === id))
    .filter((course): course is Course => !!course);   // улучшенный filter с type guard

  return {
    selectedCourses: selectedCoursesData ?? [],
    isLoading: coursesLoading || userLoading,
    error: coursesError || userError ? getErrorMessage(coursesError || userError) : null,
    mutateUser,   // ← экспортируем
  };
}