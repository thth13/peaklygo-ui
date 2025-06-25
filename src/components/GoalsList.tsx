import React from 'react';

interface Step {
  id: string;
  text: string;
}

enum PrivaciyStatus {
  Private = 'private',
  Friends = 'friends',
  Public = 'public',
}

interface Goal {
  goalName: string;
  category: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  noDeadline?: boolean;
  image?: string;
  steps: Step[];
  reward?: string;
  consequence?: string;
  privacy: PrivaciyStatus;
  isCompleted: boolean;
  value: number;
  userId: string;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

interface GoalsListProps {
  goals: Goal[];
}

export const GoalsList: React.FC<GoalsListProps> = ({ goals }) => (
  <div className="space-y-4">
    {goals.map((goal) => (
      <div
        key={goal.createdAt.toString() + goal.goalName}
        className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-2"
      >
        <div className="flex items-center gap-3">
          {goal.image && <img src={goal.image} alt={goal.goalName} className="w-16 h-16 object-cover rounded" />}
          <div>
            <h2 className="text-xl font-bold">{goal.goalName}</h2>
            <div className="text-sm text-gray-500">{goal.category}</div>
          </div>
        </div>
        {goal.description && <div className="text-gray-700">{goal.description}</div>}
        <div className="text-xs text-gray-400">
          {`Старт: ${new Date(goal.startDate).toLocaleDateString()}`}
          {goal.endDate && ` — Финиш: ${new Date(goal.endDate).toLocaleDateString()}`}
          {goal.noDeadline && ' (Без конечной даты)'}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span
            className={`px-2 py-1 rounded ${
              goal.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {goal.isCompleted ? 'Завершено' : 'В процессе'}
          </span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Прогресс: {goal.progress}%</span>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Приватность: {goal.privacy}</span>
        </div>
        {goal.steps.length > 0 && (
          <div className="mt-2">
            <div className="font-semibold text-sm">Шаги:</div>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {goal.steps.map((step) => (
                <li key={step.id}>{step.text}</li>
              ))}
            </ul>
          </div>
        )}
        {goal.reward && <div className="text-green-700 text-sm">Награда: {goal.reward}</div>}
        {goal.consequence && <div className="text-red-700 text-sm">Последствие: {goal.consequence}</div>}
      </div>
    ))}
    {goals.length === 0 && <div className="text-gray-500 text-center py-8">Нет целей для отображения</div>}
  </div>
);
