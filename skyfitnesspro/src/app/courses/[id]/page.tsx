'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import Link from 'next/link';

export default function CoursePage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();

  // Маппинг для больших картинок курсов (как на главной)
  const courseBigImageMap: Record<string, string> = {
    Йога: '/yoga-big.png',
    Стретчинг: '/stretching-big.png',
    Фитнес: '/fitness-big.png',
    'Степ-аэробика': '/step-aerobics-big.png',
    Бодифлекс: '/bodyflex-big.png',
    Yoga: '/yoga-big.png',
    Stretching: '/stretching-big.png',
    Fitness: '/fitness-big.png',
  };

  // Загружаем курс
  const { data: course, error, isLoading } = useSWR(
    id ? `/courses/${id}` : null,
    (url) => api.get(url).then(res => res.data)
  );

  // Загружаем пользователя (selectedCourses)
  const { data: userData, mutate: mutateUser } = useSWR(
    isAuthenticated ? '/users/me' : null,
    () => api.get('/users/me').then(res => res.data.user ?? res.data)
  );

  const isCourseAdded = userData?.selectedCourses?.includes(id);

  const handleAddCourse = async () => {
    if (!isAuthenticated) {
      toast.error('Войдите, чтобы добавить курс');
      router.push(`/login?redirect=/courses/${id}`);
      return;
    }

    try {
      await api.post('/users/me/courses', { courseId: id });
      toast.success('Курс добавлен!');
      mutateUser(); // обновляем данные пользователя
    } catch (err) {
      toast.error('Ошибка при добавлении курса');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center">Загрузка...</div>;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen grid place-items-center text-red-600">
        Курс не найден или произошла ошибка
      </div>
    );
  }

  // Выбираем большую картинку по названию курса
  const bigImageSrc = courseBigImageMap[course.nameRU] || courseBigImageMap[course.nameEN] || '/placeholder-course-big.png';

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Большой баннер с картинкой курса */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <Image
          src={bigImageSrc}
          alt={course.nameRU}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{course.nameRU}</h1>
          <p className="text-lg md:text-xl max-w-3xl opacity-90">
            {course.description}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-0 py-10 md:py-16">
        {/* Хлебные крошки */}
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block font-medium">
          ← На главную
        </Link>

        {/* Контент для НЕ авторизованных / НЕ добавивших курс */}
        {!isAuthenticated || !isCourseAdded ? (
          <>
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-6">Подойдёт для вас, если:</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 text-white p-6 rounded-2xl">
                  <p className="text-lg">Давно хотели попробовать йогу, но не решались начать</p>
                </div>
                <div className="bg-gray-900 text-white p-6 rounded-2xl">
                  <p className="text-lg">Хотите укрепить позвоночник, избавиться от болей в спине и суставах</p>
                </div>
                <div className="bg-gray-900 text-white p-6 rounded-2xl">
                  <p className="text-lg">Ищете активность, полезную для тела и души</p>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-6">Направления</h2>
              <div className="flex flex-wrap gap-3">
                {['Йога для новичков', 'Классическая йога', 'Йогатерапия', 'Кундалини-йога', 'Хатха-йога', 'Аштанга-йога'].map((dir) => (
                  <span key={dir} className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
                    {dir}
                  </span>
                ))}
              </div>
            </section>

            {/* Мотивационный блок */}
            <section className="mt-16 md:mt-24 relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-700 to-teal-700 text-white">
              <div className="absolute inset-0">
                <Image
                  src="/bgRunner.png"
                  alt="Фон бегуна"
                  fill
                  className="object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>

              <div className="relative z-10 px-6 py-12 md:p-16 lg:p-20 max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                      Начните путь
                      <br />
                      к новому телу
                    </h2>

                    <ul className="space-y-4 text-lg md:text-xl opacity-90">
                      <li>• проработка всех групп мышц</li>
                      <li>• тренировка суставов</li>
                      <li>• улучшение циркуляции крови</li>
                      <li>• упражнения заряжают бодростью</li>
                      <li>• помогают противостоять стрессам</li>
                    </ul>

                    <button
                      onClick={handleAddCourse}
                      className="mt-8 bg-white text-green-800 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg"
                    >
                      Войдите, чтобы добавить курс
                    </button>
                  </div>

                  <div className="relative h-80 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="/runner.png"
                      alt="Спортсмен на старте"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* Контент для добавленного курса */
          <>
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">Ваш прогресс</h2>
              <div className="bg-gray-100 rounded-xl p-6">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">0/5 тренировок</span>
                  <span className="font-medium">0%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3">
                  <div className="bg-[#00C1FF] h-3 rounded-full w-[0%] transition-all"></div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6">Тренировки в курсе</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Здесь должен быть map по workouts */}
                <div className="bg-white p-6 rounded-2xl shadow-md">
                  <h3 className="text-xl font-bold mb-2">Утренняя практика</h3>
                  <p className="text-gray-600 mb-4">Йога на каждый день / 1 день</p>
                  <button className="bg-[#00C1FF] text-white px-6 py-3 rounded-full hover:bg-[#00a1e0]">
                    Посмотреть тренировку
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}