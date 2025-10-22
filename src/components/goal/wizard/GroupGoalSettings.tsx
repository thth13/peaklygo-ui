import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserPlus,
  faUsersGear,
  faPeopleGroup,
  faXmark,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { GroupGoalUserSearchResult, searchGroupGoalUsers } from '@/lib/api/goal';
import { IMAGE_URL } from '@/constants';

type MaxParticipantsOption = number | 'unlimited';

const MAX_PARTICIPANT_OPTIONS: MaxParticipantsOption[] = [5, 10, 15, 20, 50, 100, 'unlimited'];
const MIN_SEARCH_LENGTH = 2;

export interface GroupSettingsState {
  allowMembersToInvite: boolean;
  requireApproval: boolean;
  maxParticipants?: number;
}

interface GroupGoalSettingsProps {
  participantIds: string[];
  groupSettings: GroupSettingsState;
  onParticipantAdd: (participant: string) => void;
  onParticipantRemove: (participant: string) => void;
  onGroupSettingsChange: (changes: Partial<GroupSettingsState>) => void;
  goalId?: string;
}

const GroupGoalSettings: React.FC<GroupGoalSettingsProps> = ({
  participantIds,
  groupSettings,
  onParticipantAdd,
  onParticipantRemove,
  onGroupSettingsChange,
  goalId,
}) => {
  const t = useTranslations('goals.wizard.groupSettings');
  const [participantInput, setParticipantInput] = useState('');
  const [searchResults, setSearchResults] = useState<GroupGoalUserSearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputWrapperRef = useRef<HTMLDivElement | null>(null);
  const [participantsDetails, setParticipantsDetails] = useState<Record<string, GroupGoalUserSearchResult>>({});

  const handleAddParticipant = () => {
    const normalized = participantInput.trim();
    if (!normalized) {
      return;
    }
    if (participantIds.includes(normalized)) {
      setParticipantInput('');
      setIsDropdownOpen(false);
      setSearchResults([]);
      setHighlightedIndex(-1);
      return;
    }
    setParticipantsDetails((prev) => {
      if (prev[normalized]) {
        return prev;
      }
      return {
        ...prev,
        [normalized]: {
          userId: normalized,
          username: normalized,
          name: normalized,
        },
      };
    });
    onParticipantAdd(normalized);
    setParticipantInput('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    setSearchError(null);
    setHighlightedIndex(-1);
  };

  const handleMaxParticipantsChange = (value: MaxParticipantsOption) => {
    if (value === 'unlimited') {
      onGroupSettingsChange({ maxParticipants: undefined });
    } else {
      onGroupSettingsChange({ maxParticipants: value });
    }
  };

  const handleSelectSuggestion = (suggestion: GroupGoalUserSearchResult) => {
    if (participantIds.includes(suggestion.userId)) {
      setParticipantInput('');
      setSearchResults([]);
      setIsDropdownOpen(false);
      setSearchError(null);
      setHighlightedIndex(-1);
      return;
    }

    onParticipantAdd(suggestion.userId);
    setParticipantsDetails((prev) => ({
      ...prev,
      [suggestion.userId]: suggestion,
    }));
    setParticipantInput('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    setSearchError(null);
    setHighlightedIndex(-1);
  };

  useEffect(() => {
    const trimmed = participantInput.trim();

    if (trimmed.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      setIsSearchLoading(false);
      setSearchError(null);
      setHighlightedIndex(-1);
      return;
    }

    let isCancelled = false;
    setIsSearchLoading(true);
    setSearchError(null);
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);

    const debounceTimeout = setTimeout(async () => {
      try {
        const results = await searchGroupGoalUsers({
          query: trimmed,
          goalId,
          excludeUserIds: participantIds,
        });
        if (isCancelled) {
          return;
        }

        const filteredResults = results.filter((result) => !participantIds.includes(result.userId));
        setSearchResults(filteredResults);
        setSearchError(null);
        setIsDropdownOpen(true);
      } catch (error) {
        if (isCancelled) {
          return;
        }
        console.error('Failed to search group goal users:', error);
        setSearchResults([]);
        setSearchError(t('participantSearchError'));
        setIsDropdownOpen(true);
      } finally {
        if (!isCancelled) {
          setIsSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(debounceTimeout);
    };
  }, [participantInput, goalId, participantIds, t]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputWrapperRef.current && !inputWrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setParticipantsDetails((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (!participantIds.includes(key)) {
          delete next[key];
        }
      });
      return next;
    });
  }, [participantIds]);

  const handleParticipantInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
        return;
      }

      setHighlightedIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= searchResults.length) {
          return searchResults.length - 1;
        }
        return nextIndex;
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
        return;
      }

      setHighlightedIndex((prev) => {
        const nextIndex = prev - 1;
        if (nextIndex < 0) {
          return -1;
        }
        return nextIndex;
      });
      return;
    }

    if (event.key === 'Enter') {
      if (isDropdownOpen && highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
        event.preventDefault();
        handleSelectSuggestion(searchResults[highlightedIndex]);
        return;
      }
      event.preventDefault();
      handleAddParticipant();
      return;
    }

    if (event.key === 'Escape') {
      if (isDropdownOpen) {
        event.preventDefault();
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    }
  };

  const handleRemoveParticipant = (participantId: string) => {
    onParticipantRemove(participantId);
    setParticipantsDetails((prev) => {
      if (!(participantId in prev)) {
        return prev;
      }
      const { [participantId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const resolveAvatarUrl = (avatar?: string) => {
    if (!avatar) {
      return null;
    }
    return avatar.startsWith('http') ? avatar : `${IMAGE_URL}/${avatar}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 dark:border-gray-700/30 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <FontAwesomeIcon icon={faUsers} className="text-emerald-600 dark:text-emerald-300 text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{t('title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('maxParticipants')}
            </label>
            <div className="relative">
              <select
                value={groupSettings.maxParticipants ?? 'unlimited'}
                onChange={(event) =>
                  handleMaxParticipantsChange(
                    event.target.value === 'unlimited' ? 'unlimited' : Number(event.target.value),
                  )
                }
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              >
                {MAX_PARTICIPANT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === 'unlimited' ? t('maxParticipantsUnlimited') : t('maxParticipantsOption', { count: option })}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('maxParticipantsHint')}</p>
          </div>

          <div className="space-y-4">
            <label className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mt-0.5">
                  <FontAwesomeIcon icon={faUsersGear} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{t('requireApproval')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('requireApprovalDescription')}</p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupSettings.requireApproval}
                  onChange={(event) => onGroupSettingsChange({ requireApproval: event.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </div>
            </label>

            <label className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mt-0.5">
                  <FontAwesomeIcon icon={faPeopleGroup} className="text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{t('allowInvites')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('allowInvitesDescription')}</p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupSettings.allowMembersToInvite}
                  onChange={(event) => onGroupSettingsChange({ allowMembersToInvite: event.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 dark:border-gray-700/30 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <FontAwesomeIcon icon={faUserPlus} className="text-primary-600 dark:text-primary-400 text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{t('participantsTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.rich('participantsSubtitle', {
                count: participantIds.length,
                highlight: (chunks) => <span className="font-semibold text-primary-600 dark:text-primary-300">{chunks}</span>,
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1" ref={inputWrapperRef}>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <input
              type="text"
              value={participantInput}
              onChange={(event) => setParticipantInput(event.target.value)}
              onFocus={() => {
                if (participantInput.trim().length >= MIN_SEARCH_LENGTH) {
                  setIsDropdownOpen(true);
                }
              }}
              onKeyDown={handleParticipantInputKeyDown}
              placeholder={t('participantInputPlaceholder')}
              className="w-full rounded-xl border-2 border-gray-200 bg-white pl-11 pr-4 py-3 text-gray-900 transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              aria-expanded={isDropdownOpen}
              aria-autocomplete="list"
              role="combobox"
            />

            {isDropdownOpen && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <ul className="max-h-60 overflow-y-auto py-2">
                  {isSearchLoading ? (
                    <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                      {t('participantSearchLoading')}
                    </li>
                  ) : searchError ? (
                    <li className="px-4 py-2 text-sm text-red-500 dark:text-red-400">{searchError}</li>
                  ) : searchResults.length === 0 ? (
                    <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                      {t('participantSearchNoResults')}
                    </li>
                  ) : (
                    searchResults.map((result, index) => {
                      const displayPrimary = result.name?.trim() || result.username;
                      const displaySecondary =
                        result.username && result.username !== displayPrimary ? result.username : result.userId;
                      const avatarUrl = resolveAvatarUrl(result.avatar);
                      const initials = displayPrimary ? displayPrimary.charAt(0).toUpperCase() : '?';

                      return (
                        <li key={result.userId}>
                          <button
                            type="button"
                            className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                              index === highlightedIndex
                                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                            }`}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            onMouseLeave={() => setHighlightedIndex(-1)}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              handleSelectSuggestion(result);
                            }}
                          >
                            {avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatarUrl} alt={displayPrimary} className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-xs font-semibold text-primary-600 dark:text-primary-300">
                                {initials}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold leading-tight">{displayPrimary}</div>
                              <div className="truncate text-xs text-gray-500 dark:text-gray-400">{displaySecondary}</div>
                            </div>
                            <span className="text-xs font-medium text-primary-500 dark:text-primary-300">
                              {t('participantInviteAction')}
                            </span>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('participantInputHint')}</p>

        {participantIds.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {participantIds.map((participantId) => {
              const details = participantsDetails[participantId];
              const displayName = details?.name?.trim() || details?.username || participantId;
              const secondary = details?.username && details.username !== displayName ? details.username : participantId;
              const avatarUrl = resolveAvatarUrl(details?.avatar);
              const initials = displayName ? displayName.charAt(0).toUpperCase() : '?';

              return (
                <li
                  key={participantId}
                  className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-700 dark:bg-emerald-900/20"
                >
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt={displayName} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{displayName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{secondary}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(participantId)}
                    className="text-red-500 transition-colors hover:text-red-600 dark:hover:text-red-400"
                    aria-label={t('removeParticipant')}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
            {t('emptyParticipants')}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupGoalSettings;
