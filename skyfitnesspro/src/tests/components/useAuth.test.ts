import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

jest.mock('@/lib/api');

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
  });

  it('изначально не авторизован, если нет токена', async () => {
    // Мокаем запрос, который выполнится при загрузке пользователя
    mockedApi.get.mockRejectedValueOnce(new Error('Not authenticated'));
    
    const { result } = renderHook(() => useAuth());

    // Ждём завершения начальной загрузки
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('логинит пользователя и сохраняет токен', async () => {
    // Мокаем ответы в правильной последовательности
    mockedApi.post.mockResolvedValueOnce({ data: { token: 'fake-token' } });
    mockedApi.get.mockResolvedValueOnce({
      data: { email: 'test@example.com' },
    });

    const spySetItem = jest.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => useAuth());

    // Сначала ждём завершения начальной загрузки
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.login('test@example.com', 'Password123@');
    });

    // Ждём завершения обновлений после логина
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(success).toBe(true);
    expect(spySetItem).toHaveBeenCalledWith('token', 'fake-token');
    expect(mockedApi.get).toHaveBeenCalledWith('/users/me');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('выход очищает токен и состояние', async () => {
    localStorage.setItem('token', 'fake-token');
    
    // Мокаем успешный запрос за пользователем для начальной загрузки
    mockedApi.get.mockResolvedValueOnce({
      data: { email: 'test@example.com' },
    });

    const spyRemoveItem = jest.spyOn(Storage.prototype, 'removeItem');

    const { result } = renderHook(() => useAuth());

    // Ждём инициализации хука
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.logout();
    });

    expect(spyRemoveItem).toHaveBeenCalledWith('token');
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('автоматически загружает пользователя при наличии токена', async () => {
    localStorage.setItem('token', 'existing-token');
    mockedApi.get.mockResolvedValueOnce({
      data: { email: 'existing@example.com' },
    });

    const { result } = renderHook(() => useAuth());

    // Ждём загрузки пользователя
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('existing@example.com');
    expect(mockedApi.get).toHaveBeenCalledWith('/users/me');
  });

  it('обрабатывает ошибку при загрузке пользователя', async () => {
    localStorage.setItem('token', 'invalid-token');
    mockedApi.get.mockRejectedValueOnce(new Error('Token expired'));

    const spyRemoveItem = jest.spyOn(Storage.prototype, 'removeItem');

    const { result } = renderHook(() => useAuth());

    // Ждём завершения загрузки с ошибкой
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(spyRemoveItem).toHaveBeenCalledWith('token');
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeTruthy();
  });
});