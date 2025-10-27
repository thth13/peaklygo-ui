import { useTranslations } from 'next-intl';

interface GroupSettingsProps {
  ownerName: string;
  allowMembersToInvite: boolean;
  requireApproval: boolean;
  maxParticipants?: number;
  goalValue: string | number;
}

export function GroupSettings({
  ownerName,
  allowMembersToInvite,
  requireApproval,
  maxParticipants,
  goalValue,
}: GroupSettingsProps) {
  const t = useTranslations('groupGoal.settings');
  const title = t('title');
  const ownerLabel = t('owner');
  const memberInvitesLabel = t('memberInvites');
  const approvalLabel = t('approval');
  const teamLimitLabel = t('teamLimit');
  const goalValueLabel = t('goalValue');
  const editButtonText = 'Изменить настройки';

  const memberInvitesValue = allowMembersToInvite ? t('memberInvitesAllowed') : t('memberInvitesRestricted');
  const approvalValue = requireApproval ? t('approvalRequired') : t('approvalNotRequired');
  const teamLimitValue = maxParticipants ? t('teamLimitValue', { count: maxParticipants }) : t('teamLimitUnset');
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm transition-colors dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
          <span>{ownerLabel}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{ownerName}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
          <span>{memberInvitesLabel}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{memberInvitesValue}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
          <span>{approvalLabel}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{approvalValue}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
          <span>{teamLimitLabel}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{teamLimitValue}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
          <span>{goalValueLabel}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{goalValue}</span>
        </div>
      </div>
      <button
        type="button"
        className="mt-4 w-full rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        {editButtonText}
      </button>
    </section>
  );
}
