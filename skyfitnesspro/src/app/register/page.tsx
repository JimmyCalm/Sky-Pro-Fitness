'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterFormData, registerSchema } from '@/lib/types';
import { useAuthContext } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const { register: registerUser, error, isLoading } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterFormData) => {
    const success = await registerUser(data.email, data.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary py-12 px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
        >
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
            Регистрация
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="mb-5">
            <input
              {...register('email')}
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent"
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-7">
            <input
              {...register('password')}
              type="password"
              placeholder="Пароль"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent"
            />
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-3.5 rounded-full font-medium text-lg
              transition-all duration-200
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-lime hover:bg-lime/90 active:bg-lime/80'}
              text-primary
            `}
          >
            {isLoading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
          </button>

          <p className="mt-6 text-center text-gray-600">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Войти
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}