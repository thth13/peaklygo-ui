'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { IMAGE_URL } from '@/constants';
import {
  getNotifications,
  markNotificationAsRead,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  markNotificationResponse,
} from '@/lib/api/notifications';
import { respondToGroupInvitation } from '@/lib/api/goal';
import { NotificationType, UserNotification } from '@/types';

export const NotificationsDropdown = () => {
  const pathname = usePathname();
  const t = useTranslations('header');
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
  const [respondingNotificationIds, setRespondingNotificationIds] = useState<Set<string>>(new Set());

  const notificationsRequestInFlight = useRef(false);
  const hasLoadedNotifications = useRef(false);
  const hasMarkedAsReadOnOpen = useRef(false);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const resolveAvatarSrc = (notification: UserNotification): string | null => {
    const candidate =
      notification.metadata?.avatarUrl ?? notification.metadata?.senderAvatar ?? notification.metadata?.inviterAvatar;

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

  const markAllUnreadAsRead = useCallback(async () => {
    setNotifications((prevNotifications) => {
      const unreadIds = prevNotifications.filter((item) => !item.read).map((item) => item._id);

      if (unreadIds.length > 0) {
        // Отправляем запрос в фоне, не блокируем UI
        markNotificationsAsRead(unreadIds).catch((error) => {
          console.error('Failed to auto-mark notifications as read', error);
        });

        // Обновляем локальное состояние сразу
        const readAt = new Date().toISOString();
        return prevNotifications.map((item) => (unreadIds.includes(item._id) ? { ...item, read: true, readAt } : item));
      }

      return prevNotifications;
    });
  }, []);

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
    const unreadIds = notifications
      .filter((notification) => !notification.read)
      .map((notification) => notification._id);
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
      setNotifications((prev) => prev.map((item) => (item.read ? item : { ...item, read: true, readAt })));
      setMarkingNotificationIds(new Set());
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
      setNotificationsActionError(t('notifications.actionError'));
    } finally {
      setIsMarkingAll(false);
    }
  }, [notifications, notificationsMeta, isMarkingAll, t]);

  const handleInvitationResponse = useCallback(
    async (notificationId: string, goalId: string | undefined, status: 'accepted' | 'declined') => {
      if (!goalId || respondingNotificationIds.has(notificationId)) {
        return;
      }

      setRespondingNotificationIds((prev) => {
        const next = new Set(prev);
        next.add(notificationId);
        return next;
      });
      setNotificationsActionError(null);

      try {
        await respondToGroupInvitation(goalId, { status });
        await markNotificationResponse(notificationId, status);

        // Обновляем локальное состояние
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notificationId
              ? { ...item, isResponded: status, read: true, readAt: new Date().toISOString() }
              : item,
          ),
        );
      } catch (error) {
        console.error('Failed to respond to invitation', error);
        setNotificationsActionError(t('notifications.actionError'));
      } finally {
        setRespondingNotificationIds((prev) => {
          const next = new Set(prev);
          next.delete(notificationId);
          return next;
        });
      }
    },
    [respondingNotificationIds, t],
  );

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
      hasMarkedAsReadOnOpen.current = false;
      // Загружаем уведомления
      loadNotifications().then(() => {
        // Помечаем все непрочитанные как прочитанные только после загрузки
        if (!hasMarkedAsReadOnOpen.current) {
          hasMarkedAsReadOnOpen.current = true;
          void markAllUnreadAsRead();
        }
      });
    }
  }, [notificationsOpen, loadNotifications, markAllUnreadAsRead]);

  console.log(notifications);
  return (
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
                  const isResponding = respondingNotificationIds.has(notification._id);

                  return (
                    <li
                      key={notification._id}
                      className={`px-4 py-3 transition-colors ${
                        notification.read ? 'bg-transparent' : 'bg-gray-100 dark:bg-gray-800/60'
                      } ${
                        isMarking
                          ? 'cursor-wait opacity-60'
                          : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60'
                      }`}
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
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{notification.title}</p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                          {timestamp && (
                            <span className="mt-2 block text-xs text-gray-400 dark:text-gray-500">{timestamp}</span>
                          )}
                          {isGroupInvite && !notification.isResponded && !isResponding && (
                            <div className="mt-3 flex gap-2">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleInvitationResponse(
                                    notification._id,
                                    notification.metadata?.goalId,
                                    'accepted',
                                  );
                                }}
                                onKeyDown={(event) => {
                                  event.stopPropagation();
                                }}
                                className="inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={isFetchingNotifications || isMarking || isResponding}
                              >
                                {isResponding ? t('notifications.accepting') : t('notifications.accept')}
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleInvitationResponse(
                                    notification._id,
                                    notification.metadata?.goalId,
                                    'declined',
                                  );
                                }}
                                onKeyDown={(event) => {
                                  event.stopPropagation();
                                }}
                                className="inline-flex items-center justify-center rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-gray-100 dark:focus:ring-gray-600 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={isFetchingNotifications || isMarking || isResponding}
                              >
                                {isResponding ? t('notifications.declining') : t('notifications.decline')}
                              </button>
                            </div>
                          )}
                          {isGroupInvite && !notification.isResponded && isResponding && (
                            <div className="mt-3">
                              <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                                {t('notifications.processing')}
                              </span>
                            </div>
                          )}
                          {/* {isGroupInvite && notification.isResponded && (
                            <div className="mt-3">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                  notification.isResponded === 'accepted'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
                                }`}
                              >
                                {notification.isResponded === 'accepted'
                                  ? t('notifications.invitationAccepted')
                                  : t('notifications.invitationDeclined')}
                              </span>
                            </div>
                          )} */}
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
  );
};
