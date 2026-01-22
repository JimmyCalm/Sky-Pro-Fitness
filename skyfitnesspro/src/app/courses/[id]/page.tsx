'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useSWR from 'swr';

export default function CoursePage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();

  // Маппинг больших картинок курсов
  const courseBigImageMap: Record<string, string> = {
    Йога: '/yoga-big.png',
    Стретчинг: '/stretching-big.png',
    Фитнес: '/fitness-big.png',
    'Степ-аэробика': '/step-aerobics-big.png',
    Бодифлекс: '/bodyflex-big.png',
    Yoga: '/yoga-big.png',
    Stretching: '/stretching-big.png',
    Fitness: '/fitness-big.png',
    Bodyflex: '/bodyflex-big.png',
  };

  // Загружаем курс
  const {
    data: course,
    error,
    isLoading,
  } = useSWR(id ? `/courses/${id}` : null, (url) =>
    api.get(url).then((res) => res.data)
  );

  // Данные пользователя
  const { data: userData, mutate: mutateUser } = useSWR(
    isAuthenticated ? '/users/me' : null,
    () => api.get('/users/me').then((res) => res.data.user ?? res.data)
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
      mutateUser();
    } catch (err) {
      toast.error('Ошибка при добавлении курса');
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen grid place-items-center">Загрузка...</div>
    );

  if (error || !course) {
    return (
      <div className="min-h-screen grid place-items-center text-red-600">
        Курс не найден
      </div>
    );
  }

  const bigImageSrc =
    courseBigImageMap[course.nameRU] ||
    courseBigImageMap[course.nameEN] ||
    '/placeholder-course-big.png';

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Большой баннер */}
      <div className="relative mx-auto w-full max-w-[1160px] h-[310px] overflow-hidden rounded-[30px]">
        <Image
          src={bigImageSrc}
          alt={course.nameRU}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h1 className="text-5xl md:text-6xl font-bold">{course.nameRU}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Хлебные крошки */}
        <Link
          href="/"
          className="text-blue-600 hover:underline mb-8 inline-block font-medium"
        >
          ← На главную
        </Link>

        {/* Подойдёт для вас, если: */}
        <section className="mt-12 mb-16 max-w-[1160px] mx-auto">
          <h2 className="text-4xl font-bold mb-10">Подойдёт для вас, если:</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {course.fitting?.map((item: string, index: number) => (
              <div
                key={index}
                className="bg-gray-900 text-white rounded-2xl p-8 flex items-start gap-6 h-[141px] w-full max-w-[368px]"
              >
                <span className="text-[75px] font-medium leading-none text-white">
                  {index + 1}
                </span>
                <p className="text-lg leading-relaxed mt-3">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Направления */}
        <section className="mb-20 max-w-[1160px] mx-auto">
          <h2 className="text-4xl font-bold mb-8">Направления</h2>

          <div className="bg-[#BCEC30] rounded-2xl p-8 h-[146px] flex items-center">
            <div className="grid grid-cols-3 gap-4 w-full">
              {course.directions?.map((dir: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white/20 px-5 py-3 rounded-full text-black font-medium text-base"
                >
                  <Image src="/star.png" alt="Звезда" width={24} height={24} />
                  {dir}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Мотивационный блок — только если курс НЕ добавлен */}
        {(!isAuthenticated || !isCourseAdded) && (
          <section className="relative rounded-3xl overflow-hidden bg-[#0A3D2E] text-white">
            <div className="absolute inset-0">
              <Image
                src="/bgRunner.png"
                alt="Фон"
                fill
                className="object-cover opacity-30"
              />
            </div>

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center p-8 md:p-16 lg:p-20">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                  Начните путь
                  <br />к новому телу
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
                  className="mt-10 bg-[#BCEC30] text-black px-10 py-5 rounded-full font-bold text-lg hover:bg-[#a3d32a] transition shadow-lg"
                >
                  Войдите, чтобы добавить курс
                </button>
              </div>

              <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/runner.png"
                  alt="Спортсмен"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
