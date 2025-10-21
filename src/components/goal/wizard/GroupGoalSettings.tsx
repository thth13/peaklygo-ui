import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserPlus,
  faUsersGear,
  faPeopleGroup,
  faXmark,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

type MaxParticipantsOption = number | 'unlimited';

const MAX_PARTICIPANT_OPTIONS: MaxParticipantsOption[] = [5, 10, 15, 20, 50, 100, 'unlimited'];

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
}

const GroupGoalSettings: React.FC<GroupGoalSettingsProps> = ({
  participantIds,
  groupSettings,
  onParticipantAdd,
  onParticipantRemove,
  onGroupSettingsChange,
}) => {
  const t = useTranslations('goals.wizard.groupSettings');
  const [participantInput, setParticipantInput] = useState('');

  const handleAddParticipant = () => {
    const normalized = participantInput.trim();
    if (!normalized) {
      return;
    }
    onParticipantAdd(normalized);
    setParticipantInput('');
  };

  const handleMaxParticipantsChange = (value: MaxParticipantsOption) => {
    if (value === 'unlimited') {
      onGroupSettingsChange({ maxParticipants: undefined });
    } else {
      onGroupSettingsChange({ maxParticipants: value });
    }
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
          <input
            type="text"
            value={participantInput}
            onChange={(event) => setParticipantInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAddParticipant();
              }
            }}
            placeholder={t('participantInputPlaceholder')}
            className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          />
          <button
            type="button"
            onClick={handleAddParticipant}
            className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors"
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            {t('addParticipant')}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('participantInputHint')}</p>

        {participantIds.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {participantIds.map((participant) => (
              <li
                key={participant}
                className="flex items-center justify-between p-3 bg-emerald-50/70 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCircleCheck} />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white break-all">{participant}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onParticipantRemove(participant)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                  aria-label={t('removeParticipant')}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </li>
            ))}
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
