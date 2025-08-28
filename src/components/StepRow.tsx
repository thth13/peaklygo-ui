import React from 'react';
import { Step } from '@/types';
import { faGripVertical, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StepRowProps {
  id: string;
  step: Step;
  onChange: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}

export const StepRow: React.FC<StepRowProps> = ({ id, step, onChange, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg transition-colors select-none ${
        isDragging ? 'ring-2 ring-blue-400 shadow-lg' : ''
      }`}
    >
      <span
        className="text-gray-400 dark:text-gray-500 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <FontAwesomeIcon icon={faGripVertical} />
      </span>
      <input
        className="flex-1 border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        placeholder="Введите шаг..."
        value={step.text}
        onChange={(e) => onChange(step.id, e.target.value)}
      />
      <button
        type="button"
        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
        onClick={() => onRemove(step.id)}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  );
};
