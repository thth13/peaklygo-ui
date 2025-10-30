'use client';

import { usePathname } from 'next/navigation';
import LinkWithProgress from '../Link';
import ThemeToggle from '../ThemeToggle';
import Image from 'next/image';
import { useUserProfile } from '@/context/UserProfileContext';
import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import OverlaySidebar from './sidebar/OverlaySidebar';
import { IMAGE_URL } from '@/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faBell } from '@fortawesome/free-solid-svg-icons';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { AuthContext } from '@/context/AuthContext';
import {
  getNotifications,
  markNotificationAsRead,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
} from '@/lib/api/notifications';
import { NotificationType, UserNotification } from '@/types';

export const Header = () => {
  const pathname = usePathname();
  const { profile, isLoading } = useUserProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isFetchingNotifications, setIsFetchingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [notificationsActionError, setNotificationsActionError] = useState<string | null>(null);
  const [notificationsMeta, setNotificationsMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  } | null>(null);
  const [markingNotificationIds, setMarkingNotificationIds] = useState<Set<string>>(new Set());
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const notificationsRequestInFlight = useRef(false);
  const hasLoadedNotifications = useRef(false);
  const { logout } = useContext(AuthContext);
  const t = useTranslations('header');
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const resolveAvatarSrc = (notification: UserNotification): string | null => {
    const candidate =
      notification.metadata?.avatarUrl ??
      notification.metadata?.senderAvatar ??
      notification.metadata?.inviterAvatar;

    if (!candidate) {
      return null;
    }

    if (/^https?:\/\//i.test(candidate)) {
      return candidate;
    }

    const trimmed = candidate.startsWith('/') ? candidate.slice(1) : candidate;
    return `${IMAGE_URL}/${trimmed}`;
  };

  const resolveInitial = (notification: UserNotification): string => {
    const source = notification.metadata?.senderName ?? notification.title;
    const initial = source?.trim().charAt(0)?.toUpperCase();
    return initial || 'N';
  };

  const resolveIndicatorClass = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.GroupInvite:
        return 'bg-primary-500';
      case NotificationType.Subscription:
        return 'bg-indigo-500';
      case NotificationType.Message:
      default:
        return 'bg-emerald-500';
    }
  };

  const formatNotificationTimestamp = (value: string | Date | undefined): string => {
    if (!value) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleString();
  };

  const loadNotifications = useCallback(async () => {
    if (notificationsRequestInFlight.current) {
      return;
    }

    notificationsRequestInFlight.current = true;
    setNotificationsError(null);
    setNotificationsActionError(null);

    if (!hasLoadedNotifications.current) {
      setIsLoadingNotifications(true);
    } else {
      setIsFetchingNotifications(true);
    }

    try {
      const response = await getNotifications({
        page: 1,
        limit: 20,
      });
      setNotifications(response.items ?? []);
      setNotificationsMeta({
        total: response.total,
        page: response.page,
        limit: response.limit,
        hasNextPage: response.hasNextPage,
      });
      setMarkingNotificationIds(new Set());
    } catch (error) {
      console.error('Failed to load notifications', error);
      setNotificationsError(t('notifications.error'));
    } finally {
      hasLoadedNotifications.current = true;
      notificationsRequestInFlight.current = false;
      setIsLoadingNotifications(false);
      setIsFetchingNotifications(false);
    }
  }, [t]);

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      const target = notifications.find((item) => item._id === notificationId);
      if (!notificationId || !target || target.read || markingNotificationIds.has(notificationId)) {
        return;
      }

      setMarkingNotificationIds((prev) => {
        const next = new Set(prev);
        next.add(notificationId);
        return next;
      });
      setNotificationsActionError(null);

      try {
        await markNotificationAsRead(notificationId);
        const readAt = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((item) => (item._id === notificationId ? { ...item, read: true, readAt } : item)),
        );
      } catch (error) {
        console.error('Failed to mark notification as read', error);
        setNotificationsActionError(t('notifications.actionError'));
      } finally {
        setMarkingNotificationIds((prev) => {
          if (!prev.has(notificationId)) {
            return prev;
          }
          const next = new Set(prev);
          next.delete(notificationId);
          return next;
        });
      }
    },
    [notifications, markingNotificationIds, t],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((notification) => !notification.read).map((notification) => notification._id);
    if (!unreadIds.length || isMarkingAll) {
      return;
    }

    setIsMarkingAll(true);
    setNotificationsActionError(null);

    try {
      if (!notificationsMeta || notificationsMeta.hasNextPage) {
        await markAllNotificationsAsRead();
      } else {
        await markNotificationsAsRead(unreadIds);
      }

      const readAt = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((item) => (item.read ? item : { ...item, read: true, readAt })),
      );
      setMarkingNotificationIds(new Set());
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
      setNotificationsActionError(t('notifications.actionError'));
    } finally {
      setIsMarkingAll(false);
    }
  }, [notifications, notificationsMeta, isMarkingAll, t]);

  useEffect(() => {
    if (!notificationsOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  useEffect(() => {
    setNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (notificationsOpen) {
      void loadNotifications();
    }
  }, [notificationsOpen, loadNotifications]);

  if (pathname === '/auth/login' || pathname === '/auth/register') return null;

  // Show different header for homepage
  if (pathname === '/') {
    return (
      <header className="bg-white shadow-sm py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-600">PeaklyGo</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-6">
            <LanguageSwitcher />
            <a
              href="#how-it-works"
              className="hidden sm:block text-gray-600 hover:text-primary-600 font-medium cursor-pointer"
            >
              {t('howItWorks')}
            </a>
            <a href="#cta" className="hidden sm:block text-gray-600 hover:text-primary-600 font-medium cursor-pointer">
              {t('community')}
            </a>
            <LinkWithProgress
              href="/auth/login"
              className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 sm:px-6 rounded-lg font-medium text-sm sm:text-base"
            >
              {t('login')}
            </LinkWithProgress>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <LinkWithProgress href="/">
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 cursor-pointer flex items-baseline gap-2">
                <span>PeaklyGo</span>
                <span className="text-[0.55rem] leading-none px-1 py-0.5 rounded bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold tracking-wide">
                  beta
                </span>
              </h1>
            </LinkWithProgress>
          </div>
          <div className="flex items-center space-x-4">
            <div ref={notificationsRef} className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="relative p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={t('notifications.ariaLabel')}
                aria-expanded={notificationsOpen}
                aria-haspopup="dialog"
              >
                <FontAwesomeIcon icon={faBell} className="h-5 w-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary-600 px-1 text-[0.625rem] font-semibold leading-4 text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 z-50">
                  <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('notifications.title')}</p>
                    {!isLoadingNotifications && unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => void handleMarkAllAsRead()}
                        disabled={isMarkingAll}
                        className="text-xs font-medium text-primary-600 transition-colors hover:text-primary-500 disabled:opacity-60 disabled:hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        {isMarkingAll ? t('notifications.markingAll') : t('notifications.markAll')}
                      </button>
                    )}
                  </div>
                  {notificationsActionError && (
                    <div className="px-4 py-2 text-xs text-red-600 dark:text-red-300">{notificationsActionError}</div>
                  )}
                  <div className="max-h-72 overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="flex items-center justify-center px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                        {t('notifications.loading')}
                      </div>
                    ) : notificationsError ? (
                      <div className="px-4 py-6 text-sm text-gray-600 dark:text-gray-300">
                        <p>{notificationsError}</p>
                        <button
                          type="button"
                          onClick={() => void loadNotifications()}
                          className="mt-3 inline-flex items-center text-primary-600 transition-colors hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          {t('notifications.retry')}
                        </button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex items-center justify-center px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                        {t('notifications.empty')}
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {notifications.map((notification) => {
                          const avatarSrc = resolveAvatarSrc(notification);
                          const timestamp = formatNotificationTimestamp(notification.createdAt);
                          const initial = resolveInitial(notification);
                          const isGroupInvite = notification.type === NotificationType.GroupInvite;
                          const isMessage = notification.type === NotificationType.Message;
                          const isMarking = markingNotificationIds.has(notification._id);

                          return (
                            <li
                              key={notification._id}
                              className={`px-4 py-3 transition-colors ${
                                notification.read ? 'bg-transparent' : 'bg-gray-100 dark:bg-gray-800/60'
                              } ${isMarking ? 'cursor-wait opacity-60' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}
                              onClick={() => void handleMarkAsRead(notification._id)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  void handleMarkAsRead(notification._id);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              aria-pressed={notification.read}
                              aria-busy={isMarking}
                            >
                              <div className="flex items-start gap-3">
                                {isMessage ? (
                                  <div className="mt-0.5 h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                    {avatarSrc ? (
                                      <Image
                                        src={avatarSrc}
                                        alt={notification.title}
                                        width={36}
                                        height={36}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                                        {initial}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span
                                    className={`mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full ${resolveIndicatorClass(
                                      notification.type,
                                    )}`}
                                    aria-hidden="true"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                    {notification.title}
                                  </p>
                                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                                  {timestamp && (
                                    <span className="mt-2 block text-xs text-gray-400 dark:text-gray-500">
                                      {timestamp}
                                    </span>
                                  )}
                                  {isGroupInvite && (
                                    <div className="mt-3 flex gap-2">
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          void handleMarkAsRead(notification._id);
                                        }}
                                        onKeyDown={(event) => {
                                          event.stopPropagation();
                                        }}
                                        className="inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-70"
                                        disabled={isFetchingNotifications || isMarking}
                                      >
                                        {t('notifications.accept')}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          void handleMarkAsRead(notification._id);
                                        }}
                                        onKeyDown={(event) => {
                                          event.stopPropagation();
                                        }}
                                        className="inline-flex items-center justify-center rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-gray-100 dark:focus:ring-gray-600 disabled:opacity-70"
                                        disabled={isFetchingNotifications || isMarking}
                                      >
                                        {t('notifications.decline')}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
            <ThemeToggle />
            {/* <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <FontAwesomeIcon icon={faBell} />
            </button>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <FontAwesomeIcon icon={faEnvelope} />
            </button> */}
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" aria-hidden />
            ) : profile ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={logout}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={t('logout')}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                </button>
                <button
                  aria-label={t('profileMenu')}
                  aria-expanded={sidebarOpen}
                  onClick={() => setSidebarOpen(true)}
                  className="h-8 w-8 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {profile.avatar ? (
                    <Image
                      src={`${IMAGE_URL}/${profile.avatar}`}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-white text-xl" />
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <a
                href="/auth/register"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
              >
                {t('register')}
              </a>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {sidebarOpen && <OverlaySidebar onClose={() => setSidebarOpen(false)} />}
    </>
  );
};
