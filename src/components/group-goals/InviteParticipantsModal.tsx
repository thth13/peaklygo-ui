'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faMagnifyingGlass,
  faPaperPlane,
  faSpinner,
  faUserPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { IMAGE_URL } from '@/constants';
import { ParticipantRole } from '@/types';
import { addGroupParticipants, searchGroupGoalUsers, type GroupGoalUserSearchResult } from '@/lib/api/goal';

interface InviteParticipantsModalProps {
  goalId: string;
  isOpen: boolean;
  onClose: () => void;
  onInvited?: (count: number) => void;
}

const MIN_SEARCH_LENGTH = 2;

const roleOptions: Array<{ value: ParticipantRole; translationKey: string }> = [
  { value: ParticipantRole.Member, translationKey: 'roleMember' },
  { value: ParticipantRole.Admin, translationKey: 'roleAdmin' },
];

const resolveAvatarUrl = (avatar?: string | null): string | null => {
  if (!avatar) {
    return null;
  }
  return avatar.startsWith('http') ? avatar : `${IMAGE_URL}/${avatar}`;
};

export function InviteParticipantsModal({ goalId, isOpen, onClose, onInvited }: InviteParticipantsModalProps) {
  const t = useTranslations('groupGoal.invite');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupGoalUserSearchResult[]>([]);
  const [selected, setSelected] = useState<GroupGoalUserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitInFlight, setSubmitInFlight] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [role, setRole] = useState<ParticipantRole>(ParticipantRole.Member);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedIds = useMemo(() => selected.map((item) => item.userId), [selected]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelected([]);
      setSearchError(null);
      setHighlightedIndex(-1);
      setRole(ParticipantRole.Member);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setIsLoading(false);
      setSearchError(null);
      setHighlightedIndex(-1);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setSearchError(null);
    setHighlightedIndex(-1);

    const debounce = setTimeout(async () => {
      try {
        const response = await searchGroupGoalUsers({
          query: trimmed,
          goalId,
          excludeUserIds: selectedIds,
        });
        if (isCancelled) {
          return;
        }
        setResults(response);
      } catch (error) {
        console.error('[InviteParticipantsModal] search failed', error);
        if (!isCancelled) {
          setResults([]);
          setSearchError(t('searchError'));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(debounce);
    };
  }, [goalId, isOpen, query, selectedIds, t]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const focusTimeout = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(focusTimeout);
    }
    return undefined;
  }, [isOpen]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSelect = (candidate: GroupGoalUserSearchResult) => {
    if (selectedIds.includes(candidate.userId)) {
      toast(t('alreadyAdded'));
      return;
    }
    setSelected((prev) => [...prev, candidate]);
    setQuery('');
    setResults([]);
    setHighlightedIndex(-1);
  };

  const handleRemove = (userId: string) => {
    setSelected((prev) => prev.filter((item) => item.userId !== userId));
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      toast.error(t('selectionEmpty'));
      return;
    }

    try {
      setSubmitInFlight(true);
      await addGroupParticipants(goalId, {
        userIds: selectedIds,
        role,
      });
      toast.success(t('success', { count: selected.length }));
      onInvited?.(selected.length);
      router.refresh();
      onClose();
      setSelected([]);
      setQuery('');
      setResults([]);
      setSearchError(null);
      setHighlightedIndex(-1);
      setRole(ParticipantRole.Member);
    } catch (error) {
      console.error('[InviteParticipantsModal] submit failed', error);
      toast.error(t('error'));
    } finally {
      setSubmitInFlight(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        if (results.length === 0) {
          return -1;
        }
        const next = prev + 1;
        return next >= results.length ? results.length - 1 : next;
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        if (results.length === 0) {
          return -1;
        }
        const next = prev - 1;
        return next < 0 ? -1 : next;
      });
      return;
    }

    if (event.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        event.preventDefault();
        handleSelect(results[highlightedIndex]);
        return;
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={handleOverlayClick}
    >
      <div ref={containerRef} className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-gray-900">
        <button
          type="button"
          className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
          onClick={onClose}
          aria-label={tCommon('close')}
        >
          <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
        </button>

        <header className="flex items-start gap-3 border-b border-gray-100 px-6 py-5 dark:border-gray-800">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
            <FontAwesomeIcon icon={faUserPlus} className="text-primary-600 dark:text-primary-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
        </header>

        <div className="space-y-6 px-6 py-6">
          <div>
            <label
              htmlFor="invite-search"
              className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              {t('inputLabel')}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                id="invite-search"
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('searchPlaceholder')}
                className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                autoComplete="off"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('searchHint')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <span>{t('resultsTitle')}</span>
                  <span>
                    {isLoading ? (
                      <FontAwesomeIcon icon={faSpinner} spin className="text-primary-500" />
                    ) : query.trim().length >= MIN_SEARCH_LENGTH ? (
                      t('resultsCount', { count: results.length })
                    ) : (
                      t('resultsIdle')
                    )}
                  </span>
                </div>
              </div>

              <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {searchError ? (
                  <li className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
                    {searchError}
                  </li>
                ) : results.length === 0 ? (
                  query.trim().length >= MIN_SEARCH_LENGTH ? (
                    <li className="rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      {t('searchEmpty')}
                    </li>
                  ) : (
                    <li className="rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400 dark:border-gray-700 dark:text-gray-500">
                      {t('searchPlaceholderHint')}
                    </li>
                  )
                ) : (
                  results.map((user, index) => {
                    const avatarUrl = resolveAvatarUrl(user.avatar);
                    const isHighlighted = index === highlightedIndex;
                    return (
                      <li key={user.userId}>
                        <button
                          type="button"
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                            isHighlighted
                              ? 'border-primary-400 bg-primary-50 text-primary-700 dark:border-primary-600 dark:bg-primary-900/40 dark:text-primary-200'
                              : 'border-gray-200 bg-white text-gray-800 hover:border-primary-300 hover:bg-primary-50/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-primary-600'
                          }`}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onMouseLeave={() => setHighlightedIndex(-1)}
                          onClick={() => handleSelect(user)}
                        >
                          {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={avatarUrl}
                              alt={user.name || user.username}
                              className="h-10 w-10 rounded-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600 dark:bg-primary-900/40 dark:text-primary-200">
                              {(user.name || user.username || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">
                              {user.name?.trim() || user.username || user.userId}
                            </div>
                            <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {user.username && user.username !== user.name ? user.username : user.userId}
                            </div>
                          </div>
                          <span className="text-xs font-medium text-primary-500 dark:text-primary-300">
                            {t('addAction')}
                          </span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            <aside className="space-y-4">
              <div>
                <label
                  htmlFor="invite-role"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  {t('roleLabel')}
                </label>
                <div className="relative">
                  <select
                    id="invite-role"
                    value={role}
                    onChange={(event) => setRole(event.target.value as ParticipantRole)}
                    className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white py-3 pl-4 pr-10 text-sm font-medium text-gray-900 transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.translationKey)}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <FontAwesomeIcon icon={faChevronDown} />
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-200">
                  <span>{t('selectedTitle')}</span>
                  <span className="text-xs font-medium text-primary-500 dark:text-primary-300">
                    {t('selectionCount', { count: selected.length })}
                  </span>
                </div>

                {selected.length === 0 ? (
                  <div className="mt-2 rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    {t('emptySelected')}
                  </div>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {selected.map((user) => {
                      const avatarUrl = resolveAvatarUrl(user.avatar);
                      return (
                        <li
                          key={user.userId}
                          className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50/70 px-4 py-3 dark:border-primary-700 dark:bg-primary-900/30"
                        >
                          <div className="flex items-center gap-3">
                            {avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={avatarUrl}
                                alt={user.name || user.username}
                                className="h-8 w-8 rounded-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                                {(user.name || user.username || '?').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                {user.name?.trim() || user.username || user.userId}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.username && user.username !== user.name ? user.username : user.userId}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-500 transition-colors hover:text-red-600 dark:hover:text-red-400"
                            onClick={() => handleRemove(user.userId)}
                            aria-label={t('removeAction')}
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800">
          <button
            type="button"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            onClick={onClose}
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitInFlight}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitInFlight && <FontAwesomeIcon icon={faSpinner} spin className="h-4 w-4" />}
            <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
            {submitInFlight ? t('submitting') : t('submit')}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default InviteParticipantsModal;
