'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableStepItemProps {
  id: string;
  step: string;
  index: number;
  onUpdate: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const SortableStepItem: React.FC<SortableStepItemProps> = ({ id, step, index, onUpdate, onRemove, canRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`step-item flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-300 transition-colors ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div {...listeners} className="flex-shrink-0 cursor-grab active:cursor-grabbing">
        <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
          {index + 1}
        </div>
      </div>
      <input
        type="text"
        value={step}
        onChange={(e) => onUpdate(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 cursor-text"
        placeholder={index === 0 ? 'Добавьте первый шаг...' : `Шаг ${index + 1}...`}
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faTrash} className="text-sm" />
        </button>
      )}
    </div>
  );
};

interface StepsManagerProps {
  steps: string[];
  onStepsChange: (steps: string[]) => void;
  goalName: string;
}

export const StepsManager: React.FC<StepsManagerProps> = ({ steps, onStepsChange, goalName }) => {
  const updateStep = (index: number, value: string) => {
    const newSteps = steps.map((step, i) => (i === index ? value : step));
    onStepsChange(newSteps);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    onStepsChange(newSteps);
  };

  const addStep = () => {
    onStepsChange([...steps, '']);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = steps.findIndex((_, index) => `step-${index}` === active.id);
      const newIndex = steps.findIndex((_, index) => `step-${index}` === over.id);

      onStepsChange(arrayMove(steps, oldIndex, newIndex));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <>
      {/* Goal Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-800 mb-1">Ваша цель:</h3>
        <p className="text-gray-600">{goalName || 'Пробежать полумарафон'}</p>
      </div>

      {/* Steps Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-lg font-bold text-gray-800">Шаги достижения цели</label>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Необязательно</span>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={steps.map((_, index) => `step-${index}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 mb-4">
              {steps.map((step, index) => (
                <SortableStepItem
                  key={`step-${index}`}
                  id={`step-${index}`}
                  step={step}
                  index={index}
                  onUpdate={(value) => updateStep(index, value)}
                  onRemove={() => removeStep(index)}
                  canRemove={steps.length > 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          type="button"
          onClick={addStep}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Добавить шаг</span>
        </button>

        <p className="text-sm text-gray-500 mt-3">Шаги помогут структурировать работу над целью</p>
      </div>
    </>
  );
};

export default StepsManager;
