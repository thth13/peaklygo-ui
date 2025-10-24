interface GroupGoalStatsProps {
  title: string;
  progressLabel: string;
  participantsLabel: string;
  activeLabel: string;
  pendingLabel: string;
  progressValue: number;
  totalParticipants: number;
  activeParticipants: number;
  pendingInvitations: number;
}

export function GroupGoalStats({
  title,
  progressLabel,
  participantsLabel,
  activeLabel,
  pendingLabel,
  progressValue,
  totalParticipants,
  activeParticipants,
  pendingInvitations,
}: GroupGoalStatsProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm transition-colors dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      <div className="mt-5 space-y-4 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
          <span>{progressLabel}</span>
          <span className="text-base font-semibold text-primary-600 dark:text-primary-400">{progressValue}%</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
          <span>{participantsLabel}</span>
          <span className="text-base font-semibold text-gray-800 dark:text-white">{totalParticipants}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
          <span>{activeLabel}</span>
          <span className="text-base font-semibold text-green-600 dark:text-green-300">{activeParticipants}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
          <span>{pendingLabel}</span>
          <span className="text-base font-semibold text-yellow-600 dark:text-yellow-300">{pendingInvitations}</span>
        </div>
      </div>
    </section>
  );
}
