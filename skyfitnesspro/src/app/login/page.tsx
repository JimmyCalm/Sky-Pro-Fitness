'use client'; // client-side для форм
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormData, loginSchema } from '@/lib/types';
import { useAuthContext } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { login, error, isLoading } = useAuthContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl mb-6 text-center">Вход</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          {...register('email')}
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        <input
          {...register('password')}
          type="password"
          placeholder="Пароль"
          className="w-full p-2 mb-4 border rounded"
        />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#BCEC30] text-primary p-2 rounded"
        >
          {isLoading ? 'Загрузка...' : 'Войти'}
        </button>
        <p className="mt-4 text-center">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-blue-500">
            Регистрация
          </Link>
        </p>
      </form>
    </div>
  );
}
