import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrophy } from '@fortawesome/free-solid-svg-icons';
// import { faFacebook, faTwitter, faLinkedin, faInstagram } from '@fortawesome/free-brands-svg-icons';
import Link from '@/components/Link';
import { LeftSidebar } from '@/components/layout/sidebar';
import { Goal } from '@/types';
import { getGoal } from '@/lib/api/goal';
import { getProfile } from '@/lib/api/profile';
import { CertificateSeal } from '@/components/CertificateSeal';
import { CertificateDownloadButton } from '@/components/CertificateDownloadButton';
import { formatDate } from '@/lib/utils';
import { cookies } from 'next/headers';
import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerApi } from '@/lib/serverAxios';

interface CertificatePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations('goals');

  try {
    const goal = await getGoal(id);

    return {
      title: `${t('certificate.title')} — ${goal.goalName} | PeaklyGo`,
      description: t('certificate.subtitle'),
      alternates: { canonical: `/goal/${id}/certificate` },
    };
  } catch {
    return {
      title: `${t('certificate.title')} — PeaklyGo`,
      description: t('certificate.subtitle'),
      alternates: { canonical: `/goal/${id}/certificate` },
    };
  }
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { id } = await params;
  const t = await getTranslations('goals');
  const locale = await getLocale();

  const cookieStore = await cookies();
  const currentUserId = cookieStore.get('userId')?.value;

  let goal: Goal | null = null;
  try {
    goal = await getGoal(id);
  } catch (error) {
    console.error('Failed to fetch goal:', error);
  }

  if (!goal) {
    return notFound();
  }

  // Проверка: цель должна быть завершена и принадлежать текущему пользователю
  if (!goal.isCompleted || currentUserId !== goal.userId) {
    return notFound();
  }

  // Получаем данные для сертификата
  const serverApi = await createServerApi();
  let userName = 'Пользователь';

  try {
    const userProfile = await getProfile(goal.userId, serverApi);
    userName = userProfile.name || userProfile.user.username || 'Пользователь';
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
  }

  const daysCompleted =
    goal.habitCompletedDays?.length ||
    Math.ceil(
      (new Date(goal.completedDate || goal.endDate || new Date()).getTime() - new Date(goal.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );

  // Генерируем уникальный номер сертификата на основе данных цели
  const completionDate = goal.completedDate || goal.endDate || new Date();
  const year = new Date(completionDate).getFullYear();
  const month = String(new Date(completionDate).getMonth() + 1).padStart(2, '0');
  const day = String(new Date(completionDate).getDate()).padStart(2, '0');
  const goalIdShort = goal._id.slice(-3).toUpperCase();
  const certificateNumber = `PG-${year}-${month}${day}-${goalIdShort}`;

  const issueDate = goal.completedDate ? formatDate(goal.completedDate, locale) : formatDate(new Date(), locale);

  return (
    <main className="max-w-7xl mx-auto mt-6 px-4 flex flex-col lg:flex-row mb-12">
      {/* Левая боковая панель */}
      <LeftSidebar userId={goal.userId} />

      {/* Основная область с сертификатом */}
      <div className="w-full lg:w-3/4 lg:px-6 mb-6 lg:mb-0">
        {/* Заголовок */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Link
              href={`/goal/${id}`}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center space-x-2 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
              <span className="text-sm">{t('certificate.title')}</span>
            </Link>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('certificate.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('certificate.subtitle')}</p>
        </div>

        {/* Сертификат */}
        <div
          id="certificate-canvas"
          className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 rounded-lg p-8 shadow-xl border-4 border-orange-400 dark:border-orange-600 relative overflow-hidden"
        >
          {/* Декоративные элементы */}
          <div className="absolute top-4 left-4 w-20 h-20 opacity-10">
            <svg viewBox="0 0 100 100" className="text-orange-400">
              <circle cx="50" cy="50" r="40" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute bottom-4 right-4 w-20 h-20 opacity-10">
            <svg viewBox="0 0 100 100" className="text-orange-400">
              <circle cx="50" cy="50" r="40" fill="currentColor" />
            </svg>
          </div>

          {/* Иконка трофея */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faTrophy} className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Заголовок сертификата */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-wide">
              {t('certificate.header')}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">{t('certificate.subheader')}</p>
          </div>

          {/* Основной текст */}
          <div className="text-center mb-8">
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t('certificate.confirmsText')}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 border-b-2 border-orange-500 inline-block pb-2 mb-6">
              {userName}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{t('certificate.successfullyCompleted')}</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">&ldquo;{goal.goalName}&rdquo;</p>
          </div>

          {/* Статистика */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md text-center min-w-[120px]">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{daysCompleted}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('certificate.daysCompleted')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md text-center min-w-[120px]">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('certificate.percentCompleted')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md text-center min-w-[120px]">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">+{goal.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('certificate.ratingPoints')}</p>
            </div>
          </div>

          {/* Нижняя информация */}
          <div className="border-t-2 border-orange-300 dark:border-orange-700 pt-6 mt-6">
            <div className="flex justify-between items-end">
              <div className="text-left">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  {t('certificate.completionDate')} <strong>{issueDate}</strong>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('certificate.categoryLabel')}{' '}
                  <strong className="text-green-600 dark:text-green-400">{goal.category}</strong>
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 mb-2 mx-auto">
                  <CertificateSeal />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('certificate.officialStamp')}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{t('certificate.systemSignature')}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('certificate.issueDate')} {issueDate}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{t('certificate.platform')}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('certificate.certificateNumber')} {certificateNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <CertificateDownloadButton
              targetSelector="#certificate-canvas"
              filename={`PeaklyGo-Certificate-${certificateNumber}.pdf`}
              label={t('certificate.actions.downloadPDF')}
              className="w-full"
            />
            {/* <button className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors">
              <FontAwesomeIcon icon={faShare} className="w-4 h-4" />
              <span>{t('certificate.actions.share')}</span>
            </button>
            <button className="flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg transition-colors">
              <FontAwesomeIcon icon={faPrint} className="w-4 h-4" />
              <span>{t('certificate.actions.print')}</span>
            </button> */}
          </div>

          {/* Социальные кнопки */}
          {/* <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {t('certificate.shareAchievement')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
                <span>Facebook</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                <FontAwesomeIcon icon={faTwitter} className="w-4 h-4" />
                <span>Twitter</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                <FontAwesomeIcon icon={faLinkedin} className="w-4 h-4" />
                <span>LinkedIn</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                <FontAwesomeIcon icon={faInstagram} className="w-4 h-4" />
                <span>Instagram</span>
              </button>
            </div>
          </div> */}
        </div>

        {/* Информация о сертификате */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('certificate.about.title')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-gray-600 dark:text-gray-400">{t('certificate.about.type')}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{t('certificate.about.typeValue')}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-gray-600 dark:text-gray-400">{t('certificate.about.format')}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{t('certificate.about.formatValue')}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-gray-600 dark:text-gray-400">{t('certificate.about.size')}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{t('certificate.about.sizeValue')}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-gray-600 dark:text-gray-400">{t('certificate.about.status')}</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {t('certificate.about.statusValue')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('certificate.about.issuer')}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{t('certificate.about.issuerValue')}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
