'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { ImagePreviewer } from '@/components/ImagePreviewer';
import { updateGroupGoal } from '@/lib/api/goal';
import { DayOfWeek } from '@/types';

interface GroupGoalUpdateFormValues {
  goalName: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  habitDuration: number;
  habitDaysOfWeek: DayOfWeek[];
  reward: string;
  consequence: string;
  imageUrl: string;
  allowMembersToInvite: boolean;
  requireApproval: boolean;
  maxParticipants?: number;
}

interface GroupGoalUpdateFormProps {
  goalId: string;
  initialValues: GroupGoalUpdateFormValues;
}

interface InternalFormState extends GroupGoalUpdateFormValues {
  image: File | null;
}

const dayOrder: DayOfWeek[] = [
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
  DayOfWeek.Sunday,
];

export const GroupGoalUpdateForm = ({ goalId, initialValues }: GroupGoalUpdateFormProps) => {
  const t = useTranslations('groupGoalEdit.form');
  const tNotifications = useTranslations('groupGoalEdit.notifications');
  const tErrors = useTranslations('groupGoalEdit.errors');
  const tCommon = useTranslations('common');
  const tCategories = useTranslations('goals.categories');
  const tWeekDays = useTranslations('goals.habitSettings.weekDayLabels');
  const router = useRouter();

  const [formState, setFormState] = useState<InternalFormState>({
    ...initialValues,
    habitDaysOfWeek: initialValues.habitDaysOfWeek?.length ? [...initialValues.habitDaysOfWeek] : [],
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = useMemo(() => {
    const base = [
      { value: 'health', label: tCategories('health') },
      { value: 'finance', label: tCategories('finance') },
      { value: 'development', label: tCategories('development') },
      { value: 'work', label: tCategories('work') },
      { value: 'education', label: tCategories('education') },
      { value: 'relationships', label: tCategories('relationships') },
      { value: 'sport', label: tCategories('sport') },
      { value: 'custom', label: tCategories('custom') },
    ];

    if (initialValues.category && !base.some((item) => item.value === initialValues.category)) {
      base.unshift({ value: initialValues.category, label: initialValues.category });
    }

    return base;
  }, [initialValues.category, tCategories]);

  const dayLabels = useMemo(
    () => ({
      [DayOfWeek.Monday]: tWeekDays('monday'),
      [DayOfWeek.Tuesday]: tWeekDays('tuesday'),
      [DayOfWeek.Wednesday]: tWeekDays('wednesday'),
      [DayOfWeek.Thursday]: tWeekDays('thursday'),
      [DayOfWeek.Friday]: tWeekDays('friday'),
      [DayOfWeek.Saturday]: tWeekDays('saturday'),
      [DayOfWeek.Sunday]: tWeekDays('sunday'),
    }),
    [tWeekDays],
  );

  const handleInputChange = (field: string, value: unknown) => {
    setFormState((prev) => {
      if (field === 'existingImageUrl') {
        return { ...prev, imageUrl: typeof value === 'string' ? value : '' };
      }

      if (field === 'image') {
        return { ...prev, image: (value as File) ?? null };
      }

      if (field === 'maxParticipants') {
        const numericValue = typeof value === 'number' ? value : parseInt(String(value), 10);
        return { ...prev, maxParticipants: Number.isNaN(numericValue) ? undefined : numericValue };
      }

      if (field in prev) {
        return {
          ...prev,
          [field]: value,
        } as InternalFormState;
      }

      return prev;
    });
  };

  const toggleWeekDay = (day: DayOfWeek) => {
    setFormState((prev) => {
      const exists = prev.habitDaysOfWeek.includes(day);
      const habitDaysOfWeek = exists
        ? prev.habitDaysOfWeek.filter((item) => item !== day)
        : [...prev.habitDaysOfWeek, day];

      return { ...prev, habitDaysOfWeek };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formState.goalName.trim();
    if (!trimmedName) {
      toast.error(tErrors('goalNameRequired'));
      return;
    }

    if (formState.habitDuration < 1) {
      toast.error(tErrors('habitDurationInvalid'));
      return;
    }

    if (formState.habitDaysOfWeek.length === 0) {
      toast.error(tErrors('habitDaysRequired'));
      return;
    }

    const formData = new FormData();
    const appendIfChanged = (key: string, current: string | number | boolean | null | undefined, initial: unknown) => {
      if (current === undefined || current === null) {
        return;
      }

      const normalizedInitial =
        typeof initial === 'string' || typeof initial === 'number' || typeof initial === 'boolean'
          ? initial
          : undefined;

      if (normalizedInitial !== current) {
        formData.append(key, String(current));
      }
    };

    appendIfChanged('goalName', trimmedName, initialValues.goalName?.trim());
    appendIfChanged('description', formState.description.trim(), initialValues.description?.trim());
    appendIfChanged('category', formState.category, initialValues.category);
    appendIfChanged('startDate', formState.startDate, initialValues.startDate);
    appendIfChanged('endDate', formState.endDate, initialValues.endDate);
    appendIfChanged('reward', formState.reward.trim(), initialValues.reward?.trim());
    appendIfChanged('consequence', formState.consequence.trim(), initialValues.consequence?.trim());
    appendIfChanged('habitDuration', formState.habitDuration, initialValues.habitDuration);

    const normalizedDays = [...formState.habitDaysOfWeek].sort();
    const normalizedInitialDays = [...(initialValues.habitDaysOfWeek ?? [])].sort();
    if (JSON.stringify(normalizedDays) !== JSON.stringify(normalizedInitialDays)) {
      formData.append('habitDaysOfWeek', JSON.stringify(normalizedDays));
    }

    const groupSettingsChanged =
      formState.allowMembersToInvite !== initialValues.allowMembersToInvite ||
      formState.requireApproval !== initialValues.requireApproval ||
      (formState.maxParticipants ?? null) !== (initialValues.maxParticipants ?? null);

    if (groupSettingsChanged) {
      const payload: Record<string, unknown> = {
        allowMembersToInvite: formState.allowMembersToInvite,
        requireApproval: formState.requireApproval,
      };

      if (typeof formState.maxParticipants === 'number' && formState.maxParticipants > 0) {
        payload.maxParticipants = formState.maxParticipants;
      } else if (typeof initialValues.maxParticipants === 'number') {
        payload.maxParticipants = null;
      }

      formData.append('groupSettings', JSON.stringify(payload));
    }

    if (formState.image) {
      formData.append('image', formState.image);
    }

    if (Array.from(formData.keys()).length === 0) {
      toast(tNotifications('noChanges'));
      return;
    }

    try {
      setIsSubmitting(true);
      await updateGroupGoal(goalId, formData);
      toast.success(tNotifications('updated'));
      router.replace(`/group-goals/${goalId}`);
      router.refresh();
    } catch (error) {
      console.error('[GroupGoalUpdateForm] failed to update goal', error);
      toast.error(tNotifications('failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{t('goalName')}</label>
            <input
              type="text"
              value={formState.goalName}
              onChange={(event) => handleInputChange('goalName', event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              maxLength={120}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{t('description')}</label>
            <textarea
              value={formState.description}
              onChange={(event) => handleInputChange('description', event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              rows={5}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{t('category')}</label>
            <select
              value={formState.category}
              onChange={(event) => handleInputChange('category', event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              disabled={isSubmitting}
            >
              <option value="">{t('categoryPlaceholder')}</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <ImagePreviewer
            handleInputChange={handleInputChange}
            image={formState.image}
            existingImageUrl={formState.imageUrl || undefined}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{t('startDate')}</label>
              <input
                type="date"
                value={formState.startDate}
                onChange={(event) => handleInputChange('startDate', event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{t('endDate')}</label>
              <input
                type="date"
                value={formState.endDate}
                onChange={(event) => handleInputChange('endDate', event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('habitSectionTitle')}</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('habitSectionDescription')}</p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t('habitDuration')}
                </label>
                <input
                  type="number"
                  min={1}
                  value={formState.habitDuration}
                  onChange={(event) => handleInputChange('habitDuration', Number(event.target.value))}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  disabled={isSubmitting}
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('habitDurationHint')}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{t('reward')}</label>
                <input
                  type="text"
                  value={formState.reward}
                  onChange={(event) => handleInputChange('reward', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{t('consequence')}</label>
              <input
                type="text"
                value={formState.consequence}
                onChange={(event) => handleInputChange('consequence', event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{t('habitDays')}</label>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('habitDaysHint')}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4">
                {dayOrder.map((day) => {
                  const isSelected = formState.habitDaysOfWeek.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekDay(day)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-600 dark:text-gray-200'
                      }`}
                      disabled={isSubmitting}
                    >
                      {dayLabels[day]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('groupSettingsTitle')}</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('groupSettingsDescription')}</p>

            <div className="mt-6 space-y-4">
              <label className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('allowMembersToInvite')}
                </span>
                <input
                  type="checkbox"
                  checked={formState.allowMembersToInvite}
                  onChange={(event) => handleInputChange('allowMembersToInvite', event.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={isSubmitting}
                />
              </label>

              <label className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('requireApproval')}</span>
                <input
                  type="checkbox"
                  checked={formState.requireApproval}
                  onChange={(event) => handleInputChange('requireApproval', event.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={isSubmitting}
                />
              </label>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t('maxParticipants')}
                </label>
                <input
                  type="number"
                  min={1}
                  value={formState.maxParticipants ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    handleInputChange('maxParticipants', value ? Number(value) : undefined);
                  }}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder={t('maxParticipantsPlaceholder')}
                  disabled={isSubmitting}
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('maxParticipantsHint')}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('actionsTitle')}</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('actionsDescription')}</p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('saving') : t('saveChanges')}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/group-goals/${goalId}`)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                disabled={isSubmitting}
              >
                {tCommon('cancel')}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
};

export type { GroupGoalUpdateFormValues };
