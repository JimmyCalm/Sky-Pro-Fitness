import { renderHook } from '@testing-library/react';
import { useCourseDetail } from '@/hooks/useCourseDetail';
import useSWR from 'swr';

jest.mock('swr');
jest.mock('@/lib/api');

const mockedUseSWR = useSWR as jest.Mock;

describe('useCourseDetail', () => {
  beforeEach(() => {
    mockedUseSWR.mockReset();
  });

  it('не запрашивает прогресс без токена (гость)', () => {
    mockedUseSWR.mockImplementation((key) => {
      if (key === `/courses/test-id`) {
        return { data: { _id: 'test-id' }, error: null, isLoading: false };
      }
      return { data: undefined, error: null, isLoading: false };
    });

    const { result } = renderHook(() => useCourseDetail('test-id'));

    expect(result.current.progress).toBeUndefined(); // или toBeNull(), в зависимости от реализации
    expect(result.current.isLoading).toBe(false);
  });

  it('загружает прогресс, если токен есть', () => {
    localStorage.setItem('token', 'fake');

    mockedUseSWR.mockImplementation((key) => {
      if (key === `/courses/test-id`) {
        return { data: { _id: 'test-id', workouts: ['1', '2'] }, error: null, isLoading: false };
      }
      if (key === `/users/me/progress?courseId=test-id`) {
        return {
          data: { workoutsProgress: [{ workoutId: '1', workoutCompleted: true }] },
          error: null,
          isLoading: false,
        };
      }
      return { data: null, error: null, isLoading: false };
    });

    const { result } = renderHook(() => useCourseDetail('test-id'));

    expect(result.current.progress).toEqual({
      workoutsProgress: [{ workoutId: '1', workoutCompleted: true }],
    });
    expect(result.current.completedWorkouts).toBe(1);
  });
});