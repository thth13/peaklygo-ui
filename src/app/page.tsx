import type { ReactElement } from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faComment,
  faPlus,
  faBullseye,
  faShareNodes,
  faTrophy,
  faRocket,
} from '@fortawesome/free-solid-svg-icons';
import { Activity, LandingGoal, PrivacyStatus, Step } from '@/types';
import { getLandingGoals } from '@/lib/api';
import { createServerApi } from '@/lib/serverAxios';
import { IMAGE_URL } from '@/constants';
import { GoalCard } from '@/components/GoalCard';

// const defaultGoals: Goal[] = [
//   {
//     id: 'community-goal-1',
//     avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
//     name: 'Мария Петрова',
//     username: '@mariapetrova',
//     liked: false,
//     image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/af2f25f7db-773eabf02112443687ad.png',
//     title: 'Заниматься йогой каждый день',
//     description: '30-дневный челлендж ежедневной йоги для улучшения гибкости и внутреннего покоя',
//     progress: 22,
//     total: 30,
//     progressLabel: '22/30 дней',
//     likes: 24,
//     comments: 8,
//     status: 'В процессе',
//     statusColor: 'bg-primary-100 text-primary-700',
//   },
//   {
//     id: 'community-goal-2',
//     avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
//     name: 'Алексей Иванов',
//     username: '@alexivanov',
//     liked: true,
//     image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/d6ae9d3ce5-63a04e6ca7bd7129af2b.png',
//     title: 'Прочитать 50 книг в году',
//     description: 'Читаю по одной книге в неделю для саморазвития и расширения кругозора',
//     progress: 42,
//     total: 50,
//     progressLabel: '42/50 книг',
//     likes: 67,
//     comments: 15,
//     status: 'Почти готово',
//     statusColor: 'bg-green-100 text-green-700',
//   },
//   {
//     id: 'community-goal-3',
//     avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
//     name: 'Анна Смирнова',
//     username: '@annasmirnova',
//     liked: false,
//     image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/60a72d35f1-3e0aebc6a70641abb726.png',
//     title: 'Пробежать марафон',
//     description: 'Готовлюсь к первому марафону. Тренируюсь 5 раз в неделю по специальной программе',
//     progress: 12,
//     total: 16,
//     progressLabel: '12/16 недель',
//     likes: 89,
//     comments: 23,
//     status: 'В процессе',
//     statusColor: 'bg-primary-100 text-primary-700',
//   },
//   {
//     id: 'community-goal-4',
//     avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
//     name: 'Дмитрий Козлов',
//     username: '@dmitrykozlov',
//     liked: false,
//     image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/2fec96aab4-a29bd5583b5e45e60170.png',
//     title: 'Научиться играть на гитаре',
//     description: 'Изучаю основы игры на гитаре. Цель - сыграть любимую песню к концу года',
//     progress: 6,
//     total: 10,
//     progressLabel: '6/10 песен',
//     likes: 34,
//     comments: 12,
//     status: 'В процессе',
//     statusColor: 'bg-primary-100 text-primary-700',
//   },
//   {
//     id: 'community-goal-5',
//     avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
//     name: 'Елена Волкова',
//     username: '@elenavolkova',
//     liked: true,
//     image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/a474425304-678fb9dce70a9131395b.png',
//     title: 'Здоровое питание 90 дней',
//     description: 'Перехожу на здоровое питание. Готовлю дома, исключаю фастфуд и сладкое',
//     progress: 67,
//     total: 90,
//     progressLabel: '67/90 дней',
//     likes: 45,
//     comments: 18,
//     status: 'Почти готово',
//     statusColor: 'bg-green-100 text-green-700',
//   },
//   {
//     id: 'community-goal-6',
//     avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
//     name: 'Сергей Орлов',
//     username: '@sergeyorlov',
//     liked: false,
//     image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/aded8f0d0c-c4d35f31e26062520433.png',
//     title: 'Изучить программирование',
//     description: 'Изучаю Python для смены карьеры. Цель - создать первое веб-приложение',
//     progress: 8,
//     total: 12,
//     progressLabel: '8/12 модулей',
//     likes: 78,
//     comments: 31,
//     status: 'В процессе',
//     statusColor: 'bg-primary-100 text-primary-700',
//   },
// ];

export default async function Home(): Promise<ReactElement> {
  const serverApi = await createServerApi();
  const goals = await getLandingGoals(serverApi);

  const t = await getTranslations('home');

  return (
    <div className="bg-white font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-50 py-8 sm:py-12 min-h-[280px] sm:h-[320px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t('mainHero.title')} <span className="text-primary-600">{t('mainHero.brandName')}</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            {t('mainHero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 px-4">
            <a
              href="/goal/create"
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              {t('mainHero.createGoal')}
            </a>
            <a
              href="/auth/register"
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-primary-600 px-6 py-3 rounded-lg font-semibold border border-primary-200 text-center"
            >
              {t('mainHero.register')}
            </a>
          </div>
        </div>
      </section>

      {/* Popular Goals */}
      <section id="community-goals" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('communityGoals.title')}</h2>
            <p className="text-lg text-gray-600">{t('communityGoals.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal: LandingGoal) => (
              <GoalCard key={goal._id} goal={goal} />
            ))}
          </div>

          {/* <div className="text-center mt-12">
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold">
              Посмотреть все цели
            </button>
          </div> */}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t('howItWorks.title')}</h2>
            <p className="text-lg text-gray-600 mt-2">{t('howItWorks.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-primary-100 text-primary-600 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faBullseye} className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('howItWorks.step1.title')}</h3>
              <p className="text-gray-600">{t('howItWorks.step1.description')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary-100 text-primary-600 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faShareNodes} className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('howItWorks.step2.title')}</h3>
              <p className="text-gray-600">{t('howItWorks.step2.description')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary-100 text-primary-600 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faTrophy} className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('howItWorks.step3.title')}</h3>
              <p className="text-gray-600">{t('howItWorks.step3.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('cta.title')}</h2>
          <p className="text-xl text-primary-100 mb-8">{t('cta.subtitle')}</p>
          <a
            href="/goal/create"
            className="bg-white hover:bg-gray-100 text-primary-600 px-10 py-4 rounded-lg text-lg font-bold inline-flex items-center"
          >
            <FontAwesomeIcon icon={faRocket} className="mr-2" />
            {t('cta.createGoal')}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className=" text-center text-gray-400">
            <p>
              © 2025 {t('mainHero.brandName')}. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
