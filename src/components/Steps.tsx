import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StepRow } from './StepRow';

interface Step {
  id: string;
  text: string;
}

interface StepsProps {
  steps: Step[];
  onStepChange: (id: string, text: string) => void;
  onAddStep: () => void;
  onRemoveStep: (id: string) => void;
  onReorderSteps: (sourceIndex: number, targetIndex: number) => void;
}

export const Steps: React.FC<StepsProps> = ({ steps, onStepChange, onAddStep, onRemoveStep, onReorderSteps }) => {
  const t = useTranslations('steps');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  const ids: string[] = steps.map((step) => step.id);

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex: number = ids.indexOf(String(active.id));
    const newIndex: number = ids.indexOf(String(over.id));

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return;
    }

    onReorderSteps(oldIndex, newIndex);
  };

  return (
    <div>
      <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {t('subgoalsAndSteps')}
      </label>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {steps.map((step) => (
              <StepRow key={step.id} id={step.id} step={step} onChange={onStepChange} onRemove={onRemoveStep} />
            ))}
            <button
              type="button"
              className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex items-center gap-2 transition-colors"
              onClick={onAddStep}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>{t('addStep')}</span>
            </button>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
