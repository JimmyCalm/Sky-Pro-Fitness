'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { User, CourseProgress } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useUserProfile() {
  const {
    data: user,
    error: userError,
    isLoading: userLoading,
    mutate: mutateUser,
  } = useSWR<User>('/users/me', fetcher, {
    revalidateOnFocus: false,
  });

  const {
    data: progress,
    error: progressError,
    isLoading: progressLoading,
  } = useSWR<CourseProgress[]>('/progress', fetcher, {
    revalidateOnFocus: false,
  });

  return {
    user,
    progress: progress ?? [],
    isLoading: userLoading || progressLoading,
    error:
      userError || progressError
        ? getErrorMessage(userError || progressError)
        : null,
    mutateUser,
  };
}
