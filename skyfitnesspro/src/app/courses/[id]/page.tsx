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
    <main className="min-h-screen bg-white">
  {/* Большой баннер — уже в пределах 1160px */}
  <div className="relative mx-auto w-full max-w-[1160px] h-[310px] overflow-hidden rounded-[30px]">
    <Image
      src={bigImageSrc}
      alt={course.nameRU}
      fill
      className="object-cover"
      priority
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
  </div>

  {/* Всё остальное — строго в 1160px, без боковых отступов на десктопе */}
  <div className="mx-auto w-full max-w-[1160px] px-4 sm:px-6 lg:px-0 py-12 md:py-16">

    {/* Подойдёт для вас, если: */}
    <section className="mt-12 mb-16">
      <h2 className="text-4xl font-bold mb-10">Подойдёт для вас, если:</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {course.fitting?.map((item: string, index: number) => (
          <div
            key={index}
            className="bg-gray-900 text-white rounded-2xl p-8 flex items-start gap-6 h-[141px] w-full max-w-[368px]"
          >
            <span className="text-[75px] font-medium leading-none text-[#BCEC30]">
              {index + 1}
            </span>
            <p className="text-lg leading-relaxed mt-[-15px]">{item}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Направления */}
    <section className="mb-20">
      <h2 className="text-4xl font-bold mb-8">Направления</h2>

      <div className="bg-[#BCEC30] rounded-2xl p-8 h-[146px] flex items-center">
        <div className="grid grid-cols-3 gap-4 w-full">
          {course.directions?.map((dir: string, index: number) => (
            <div
              key={index}
              className="flex items-center gap-3 px-5 py-3 rounded-full text-black font-medium text-base"
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
          <section className="relative mx-auto mt-16 md:mt-24 w-full max-w-[1160px] h-[486px]  rounded-3xl bg-white text-black shadow-lg" >
            {/* Фон */}
            <div className="absolute inset-0">
              <Image
                src="/bgRunner-big.png"
                alt="Фон"
                fill
                className="object-cover"
              />
              {/* Лёгкое затемнение для читаемости текста */}
              <div className="absolute inset-0 " />
            </div>

            {/* Контент */}
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center h-full px-8 md:px-16 lg:px-20">
              {/* Текстовая часть слева */}
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-8">
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
                  className="mt-10 bg-[#BCEC30] text-black px-10 py-5 rounded-full font-bold text-lg hover:bg-[#a3d32a] transition shadow-lg cursor-pointer"
                >
                  Войдите, чтобы добавить курс
                </button>
              </div>

              {/* Бегущий спортсмен — голова выходит за верх блока */}
              <div className="relative h-full md:h-[600px] -mt-28 md:-mt-48 lg:-mt-56 translate-x-4 md:translate-x-8 lg:translate-x-12">
                <Image
                  src="/runner.png"
                  alt="Спортсмен на старте"
                  fill
                  className="object-contain object-bottom"
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
