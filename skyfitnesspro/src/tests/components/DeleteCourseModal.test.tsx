import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import DeleteCourseModal from '@/components/DeleteCourseModal';

describe('DeleteCourseModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('отображает название курса и текст подтверждения', async () => {
    await act(async () => {
      render(
        <DeleteCourseModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          courseName="Йога для начинающих"
        />
      );
    });

    // Ждём появления модального окна
    await waitFor(() => {
      expect(screen.getByText('Удалить курс')).toBeInTheDocument();
    });

    expect(screen.getByText(/Йога для начинающих/)).toBeInTheDocument();
    expect(screen.getByText(/Прогресс будет потерян/)).toBeInTheDocument();
  });

  it('вызывает onClose при нажатии "Отмена"', async () => {
    await act(async () => {
      render(
        <DeleteCourseModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          courseName="Тест"
        />
      );
    });

    // Ждём появления кнопки
    await waitFor(() => {
      expect(screen.getByText('Отмена')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Отмена'));
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('вызывает onConfirm при нажатии "Удалить"', async () => {
    await act(async () => {
      render(
        <DeleteCourseModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          courseName="Тест"
        />
      );
    });

    // Ждём появления кнопки
    await waitFor(() => {
      expect(screen.getByText('Удалить')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Удалить'));
    });

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('не рендерится, если isOpen=false', async () => {
    const { container } = render(
      <DeleteCourseModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        courseName="Тест"
      />
    );

    // Компонент может сразу возвращать null
    expect(container.firstChild).toBeNull();
  });

  // Дополнительный тест для проверки открытия/закрытия
  it('анимирует появление и исчезновение', async () => {
    const { rerender, container } = render(
      <DeleteCourseModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        courseName="Тест"
      />
    );

    // Изначально не виден
    expect(container.firstChild).toBeNull();

    // Открываем
    await act(async () => {
      rerender(
        <DeleteCourseModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          courseName="Тест"
        />
      );
    });

    // Ждём появления
    await waitFor(() => {
      expect(screen.getByText('Удалить курс')).toBeInTheDocument();
    });

    // Закрываем
    await act(async () => {
      rerender(
        <DeleteCourseModal
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          courseName="Тест"
        />
      );
    });

    // Ждём анимации закрытия
    await waitFor(() => {
      // Модалка должна исчезнуть
      expect(screen.queryByText('Удалить курс')).not.toBeInTheDocument();
    });
  });
});