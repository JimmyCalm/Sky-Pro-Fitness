import { AxiosError } from 'axios';
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const serverMessage = error.response?.data?.message;
    const status = error.response?.status;

    if (status === 401) return 'Сессия истекла. Пожалуйста, войдите заново.';
    if (status === 403) return 'Доступ запрещён.';
    if (status === 429) return 'Слишком много запросов. Попробуйте позже.';
    
    if (typeof serverMessage === 'string') {
      return serverMessage;
    }

    return error.message || 'Ошибка запроса к серверу';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error) || 'Неизвестная ошибка';
}