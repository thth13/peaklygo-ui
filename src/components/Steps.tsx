import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faGripVertical } from '@fortawesome/free-solid-svg-icons';

interface Step {
  id: string;
  text: string;
}

interface StepsProps {
  steps: Step[];
  onStepChange: (id: string, text: string) => void;
  onAddStep: () => void;
  onRemoveStep: (id: string) => void;
}

export const Steps: React.FC<StepsProps> = ({ steps, onStepChange, onAddStep, onRemoveStep }) => {
  return (
    <div>
      <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Подцели и шаги</label>
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faGripVertical} className="text-gray-400 dark:text-gray-500 cursor-move" />
            <input
              className="flex-1 border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Введите шаг..."
              value={step.text}
              onChange={(e) => onStepChange(step.id, e.target.value)}
            />
            <button
              type="button"
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              onClick={() => onRemoveStep(step.id)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex items-center gap-2 transition-colors"
          onClick={onAddStep}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Добавить шаг</span>
        </button>
      </div>
    </div>
  );
};
