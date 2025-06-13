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
      <label className="block text-lg font-semibold text-gray-900 mb-3">Подцели и шаги</label>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <FontAwesomeIcon icon={faGripVertical} className="text-gray-400 cursor-move" />
            <input
              className="flex-1 border-none outline-none"
              placeholder="Введите шаг..."
              value={step.text}
              onChange={(e) => onStepChange(step.id, e.target.value)}
            />
            <button type="button" className="text-red-500 hover:text-red-700" onClick={() => onRemoveStep(step.id)}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ))}
        <button type="button" className="text-blue-500 hover:text-blue-600 flex items-center gap-2" onClick={onAddStep}>
          <FontAwesomeIcon icon={faPlus} />
          <span>Добавить шаг</span>
        </button>
      </div>
    </div>
  );
};
