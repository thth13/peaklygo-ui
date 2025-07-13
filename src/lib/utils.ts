export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d
    .toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(/\sг\.$/, '');
}

export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const entryDate = new Date(date);
  const diffInDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'сегодня';
  if (diffInDays === 1) return 'вчера';
  if (diffInDays < 7) return `${diffInDays} дня назад`;
  if (diffInDays < 14) return '1 неделя назад';
  return `${Math.floor(diffInDays / 7)} недели назад`;
};

export const getDayColor = (day: number): string => {
  if (day >= 60) return 'bg-blue-500 text-white';
  if (day >= 40) return 'bg-gray-500 text-white';
  return 'bg-green-500 text-white';
};
