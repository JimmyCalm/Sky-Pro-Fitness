'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { Course, User } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';

const coursesFetcher = () => api.get('/courses').then((res) => res.data);
const userFetcher = () =>
  api.get('/users/me').then((res) => {
    // Если данные обёрнуты в { user: {...} }, распаковываем их
    const data = res.data;
    return data.user ? data.user : data;
  });

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
    mutate: mutateUser,
  } = useSWR<User>('/users/me', userFetcher, {
    revalidateOnFocus: false,
  });

  const selectedCourseIds = user?.selectedCourses || [];

  let selectedCoursesData: Course[] = [];

  if (selectedCourseIds.length > 0 && allCourses && allCourses.length > 0) {
    selectedCoursesData = selectedCourseIds
      .map((id: string) => allCourses.find((course) => course._id === id))
      .filter((course): course is Course => !!course);
  }

  return {
    selectedCourses: selectedCoursesData,
    isLoading: coursesLoading || userLoading,
    error:
      coursesError || userError
        ? getErrorMessage(coursesError || userError)
        : null,
    mutateUser,
  };
}
