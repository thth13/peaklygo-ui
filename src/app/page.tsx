import type { ReactElement } from 'react';
import Image from 'next/image';
import LinkWithProgress from '@/components/Link';

interface Feature {
  title: string;
  description: string;
  iconSrc: string;
}

interface Step {
  title: string;
  description: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

const features: readonly Feature[] = [
  {
    title: 'Цели под контролем',
    description: 'Создавайте SMART‑цели, разбивайте на шаги и фиксируйте прогресс без лишней рутины.',
    iconSrc: '/window.svg',
  },
  {
    title: 'Видимый прогресс',
    description: 'Лента прогресса превращает путь в историю. Делитесь и вдохновляйте других.',
    iconSrc: '/file.svg',
  },
  {
    title: 'Фокус на важном',
    description: 'Минимум кликов, максимум смысла. Интерфейс, который не отвлекает.',
    iconSrc: '/globe.svg',
  },
  {
    title: 'Синхронизация',
    description: 'Мобильный и десктопный опыт без компромиссов. Всё работает быстро.',
    iconSrc: '/next.svg',
  },
  {
    title: 'Приватность по умолчанию',
    description: 'Публичность — по вашему желанию. Вы управляете доступом к целям.',
    iconSrc: '/vercel.svg',
  },
  {
    title: 'Гибкость',
    description: 'Подходит для личных проектов, обучения, спорта и командной работы.',
    iconSrc: '/globe.svg',
  },
];

const steps: readonly Step[] = [
  {
    title: 'Сформулируйте цель',
    description: 'Опишите результат и дедлайн. Добавьте ключевые метрики для измеримости.',
  },
  {
    title: 'Разбейте на шаги',
    description: 'Создайте понятный план: этапы, чек‑поинты и прогресс‑посты.',
  },
  {
    title: 'Достигайте и делитесь',
    description: 'Отмечайте прогресс, получайте обратную связь и закрывайте цели.',
  },
];

const testimonials: readonly Testimonial[] = [
  {
    quote: 'С PeaklyGo я впервые действительно увидел, как двигаюсь к целям, а не просто пишу планы.',
    author: 'Алексей',
    role: 'Продуктовый менеджер',
    avatar: 'https://i.pravatar.cc/120?img=12',
  },
  {
    quote: 'Идеально для учебных проектов: прогресс прозрачен, мотивация не теряется.',
    author: 'Мария',
    role: 'Студентка',
    avatar: 'https://i.pravatar.cc/120?img=32',
  },
  {
    quote: 'Команда стала быстрее достигать результатов: меньше совещаний, больше движения.',
    author: 'Дмитрий',
    role: 'Тимлид',
    avatar: 'https://i.pravatar.cc/120?img=5',
  },
];

function renderFeature(feature: Feature): ReactElement {
  return (
    <div
      key={feature.title}
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center ring-4 ring-primary-500/10 mb-4">
        <Image src={feature.iconSrc} alt="Иконка" width={24} height={24} loading="lazy" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{feature.description}</p>
    </div>
  );
}

function renderStep(step: Step, index: number): ReactElement {
  const stepNumber: number = index + 1;
  return (
    <div
      key={step.title}
      className="relative rounded-2xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
    >
      <div className="absolute -top-4 left-6 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
        {stepNumber}
      </div>
      <h4 className="mt-2 text-base font-semibold text-gray-900 dark:text-white">{step.title}</h4>
      <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">{step.description}</p>
    </div>
  );
}

function renderTestimonial(item: Testimonial): ReactElement {
  return (
    <div
      key={item.author}
      className="h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm"
    >
      <p className="text-gray-900 dark:text-white text-base leading-relaxed">“{item.quote}”</p>
      <div className="mt-4 flex items-center gap-3">
        <Image
          src={item.avatar}
          alt={item.author}
          width={40}
          height={40}
          loading="lazy"
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.author}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{item.role}</div>
        </div>
      </div>
    </div>
  );
}

export default function Home(): ReactElement {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50/60 to-transparent dark:from-primary-900/10">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30 blur-3xl" aria-hidden>
          <div className="h-[40rem] w-[40rem] bg-primary-400/30 rounded-full absolute -top-32 -left-32" />
          <div className="h-[40rem] w-[40rem] bg-primary-600/20 rounded-full absolute -bottom-32 -right-32" />
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-10 md:pt-16 pb-10 md:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-white/60 dark:bg-gray-900/60 px-3 py-1 text-xs text-primary-700 dark:text-primary-300 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
                Запускайте цели быстрее — фокусируйтесь на результате
              </div>
              <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                Делайте прогресс видимым. Достигайте целей осознанно.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl">
                PeaklyGo — место, где ваши цели превращаются в чёткий план и понятную историю прогресса. Без сложностей,
                без шума — только движение вперёд.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 md:justify-start justify-center">
                <LinkWithProgress
                  href="/auth/register"
                  className="px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Начать бесплатно
                </LinkWithProgress>
                <LinkWithProgress
                  href="/auth/login"
                  className="px-6 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Войти
                </LinkWithProgress>
              </div>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 opacity-80">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-primary-600 dark:text-primary-400"
                    aria-hidden
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.53-9.47a.75.75 0 00-1.06-1.06L9 10.94 7.53 9.47a.75.75 0 10-1.06 1.06l2 2a.75.75 0 001.06 0l4-4z" />
                  </svg>
                  Без рекламы
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-primary-600 dark:text-primary-400"
                    aria-hidden
                  >
                    <path d="M3.5 4A1.5 1.5 0 015 2.5h10A1.5 1.5 0 0116.5 4v12A1.5 1.5 0 0115 17.5H5A1.5 1.5 0 013.5 16V4zm3 1.5a.5.5 0 000 1h7a.5.5 0 000-1h-7zm0 3a.5.5 0 000 1h7a.5.5 0 000-1h-7zm0 3a.5.5 0 000 1h4a.5.5 0 000-1h-4z" />
                  </svg>
                  Лаконичный интерфейс
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-primary-600 dark:text-primary-400"
                    aria-hidden
                  >
                    <path d="M11.3 1.05a.75.75 0 01.7.47l2.1 5.22h3.15a.75.75 0 01.53 1.28l-4.63 4.64 1.74 5.21a.75.75 0 01-1.14.85L10 16.93l-4.75 2.79a.75.75 0 01-1.14-.85l1.74-5.21L1.22 8.02A.75.75 0 011.75 6.74H4.9l2.1-5.22a.75.75 0 01.7-.47h3.6z" />
                  </svg>
                  Быстрая работа
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-primary-600 dark:text-primary-400"
                    aria-hidden
                  >
                    <path d="M10 2a6 6 0 016 6v2.5c0 3.59-2.53 6.86-6 7.5-3.47-.64-6-3.91-6-7.5V8a6 6 0 016-6zm0 6a2.5 2.5 0 00-2.5 2.5v.5a2.5 2.5 0 105 0v-.5A2.5 2.5 0 0010 8z" />
                  </svg>
                  Приватность по умолчанию
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary-500/20 to-primary-700/20 rounded-3xl blur-2xl" />
              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur p-5 md:p-6 shadow-2xl max-w-lg md:max-w-xl mx-auto">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400"></span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Progress</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">72%</div>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800">
                      <div className="h-2 w-3/4 rounded-full bg-primary-600"></div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-xs font-bold">
                          +3
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Steps</div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">Completed</div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-700 text-white flex items-center justify-center text-xs font-bold">
                          2x
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Focus</div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">Boost</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 text-primary-600 dark:text-primary-400"
                        aria-hidden
                      >
                        <path d="M16.704 5.29a1 1 0 010 1.414l-7.01 7.01a1 1 0 01-1.414 0L3.296 8.74A1 1 0 114.71 7.326l3.07 3.07 6.303-6.303a1 1 0 011.414 0z" />
                      </svg>
                      Define goal and deadline
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 text-primary-600 dark:text-primary-400"
                        aria-hidden
                      >
                        <path d="M16.704 5.29a1 1 0 010 1.414l-7.01 7.01a1 1 0 01-1.414 0L3.296 8.74A1 1 0 114.71 7.326l3.07 3.07 6.303-6.303a1 1 0 011.414 0z" />
                      </svg>
                      Split into steps
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 text-primary-600 dark:text-primary-400"
                        aria-hidden
                      >
                        <path d="M16.704 5.29a1 1 0 010 1.414l-7.01 7.01a1 1 0 01-1.414 0L3.296 8.74A1 1 0 114.71 7.326l3.07 3.07 6.303-6.303a1 1 0 011.414 0z" />
                      </svg>
                      Track progress
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Почему PeaklyGo</h2>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Мы убрали всё лишнее, оставив инструменты, которые действительно помогают двигаться к результату.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{features.map(renderFeature)}</div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white/60 dark:bg-gray-900/60 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Как это работает</h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300">Три шага — от идеи до результата.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">{steps.map(renderStep)}</div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Отзывы</h2>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Что говорят пользователи о PeaklyGo.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {testimonials.map(renderTestimonial)}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white/60 dark:bg-gray-900/60 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">FAQ</h2>
          <div className="mt-8 space-y-4">
            <details className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900 dark:text-white">PeaklyGo платный?</span>
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Базовый функционал — бесплатно. Премиум — по желанию, позже.
              </p>
            </details>
            <details className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  Можно вести приватные цели?
                </span>
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Да. По умолчанию цели приватные. Публикация — опциональна.
              </p>
            </details>
            <details className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900 dark:text-white">Как делиться прогрессом?</span>
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Опубликуйте цель и отправьте ссылку. Можно ограничить видимость.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Готовы начать?</h2>
        <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Сделайте первый шаг — создайте цель сейчас. Через неделю вы увидите реальный прогресс.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <LinkWithProgress
            href="/auth/register"
            className="px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            Создать цель
          </LinkWithProgress>
          <LinkWithProgress
            href="/auth/login"
            className="px-6 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Уже есть аккаунт
          </LinkWithProgress>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} PeaklyGo. Все права защищены.
      </footer>
    </main>
  );
}
