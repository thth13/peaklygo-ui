import { useState } from 'react';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faVk } from '@fortawesome/free-brands-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { Goal } from '@/types';

interface ShareGoalProps {
  isShareModalOpen: boolean;
  setIsShareModalOpen: (isShareModalOpen: boolean) => void;
  goal: Goal;
}

export const ShareGoal = ({ isShareModalOpen, setIsShareModalOpen, goal }: ShareGoalProps) => {
  const [isCopying, setIsCopying] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [notifyFollowers, setNotifyFollowers] = useState(false);

  const handleCopyLink = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(getGoalUrl());
      toast.success('Ссылка скопирована!');
    } catch (error) {
      toast.error('Ошибка копирования ссылки');
    } finally {
      setIsCopying(false);
    }
  };

  const handleTelegramShare = () => {
    const text = createShareText();
    const url = `https://t.me/share/url?url=${encodeURIComponent(getGoalUrl())}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleTwitterShare = () => {
    const text = createShareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
      getGoalUrl(),
    )}`;
    window.open(url, '_blank');
  };

  const getGoalUrl = () => {
    return `https://peaklygo.com/goal/${goal._id}`;
  };

  const createShareText = () => {
    const baseText = `Я поставил(а) себе цель: ${goal.goalName}! Уже завершил(а) ${goal.progress}% пути.`;
    return shareMessage ? `${shareMessage}\n\n${baseText}` : baseText;
  };

  const handleShare = () => {
    setIsShareModalOpen(false);
    setShareMessage('');
    setNotifyFollowers(false);
  };
  return (
    <>
      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setIsShareModalOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Поделиться целью</h2>

            {/* Goal Info */}
            <div className="flex items-start space-x-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {goal.goalName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{goal.goalName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Уже завершил(а) {goal.progress}% пути.</p>
                <span className="inline-block mt-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs">
                  {goal.category}
                </span>
                <span className="inline-block mt-1 ml-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs">
                  {goal.progress}% завершено
                </span>
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Добавить сообщение
              </label>
              <textarea
                className="w-full min-h-[80px] border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Поделитесь своими мыслями о цели..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                maxLength={500}
              />
            </div>

            {/* Social Share Buttons */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Поделиться в:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleTelegramShare}
                  className="flex items-center justify-center space-x-2 p-3 border border-blue-200 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                >
                  <FontAwesomeIcon icon={faTelegram} className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Telegram</span>
                </button>
                <button
                  onClick={handleTwitterShare}
                  className="flex items-center justify-center space-x-2 p-3 border border-sky-200 dark:border-sky-600 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900 transition-colors"
                >
                  <FontAwesomeIcon icon={faTwitter} className="w-5 h-5 text-sky-500" />
                  <span className="text-gray-700 dark:text-gray-300">Twitter</span>
                </button>
              </div>
            </div>

            {/* Copy Link */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Или скопировать ссылку
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={getGoalUrl()}
                  readOnly
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  disabled={isCopying}
                  className="px-4 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {isCopying ? (
                    <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                  ) : (
                    <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Notify Followers */}
            <div className="mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyFollowers}
                  onChange={(e) => setNotifyFollowers(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Уведомить моих подписчиков</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleShare}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
