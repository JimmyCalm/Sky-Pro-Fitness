import z from 'zod';

export interface User {
  _id?: string;
  email: string;
  selectedCourses: string[];
  password?: string;
  courseProgress?: CourseProgress[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  _id: string;
  nameRU: string;
  nameEN: string;
  description: string;
  directions: string[];
  fitting: string[];
  difficulty?: string;
  durationInDays?: number;
  dailyDurationInMinutes?: {
    from: number;
    to: number;
  };
  workouts: string[];
}

export interface Workout {
  _id: string;
  name: string;
  video: string;
  exercises: Array<{
    name: string;
    quantity: number;
    _id?: string;
  }>;
}

export interface WorkoutProgress {
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
}

export interface CourseProgress {
  courseId: string;
  courseCompleted: boolean;
  workoutsProgress: WorkoutProgress[];
}

export const registerSchema = z.object({
  email: z.string().email('Введите корректный Email'),
  password: z
    .string()
    .min(6, 'Пароль должен содержать не менее 6 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать как минимум одну заглавную букву')
    .refine(
      (password) => (password.match(/[^A-Za-z0-9]/g) || []).length >= 2,
      'Пароль должен содержать не менее 2 спецсимволов'
    ),
});

export const loginSchema = registerSchema;

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
