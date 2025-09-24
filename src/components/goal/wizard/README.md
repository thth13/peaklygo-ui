# Goal Create Wizard Components

Этот каталог содержит компоненты для мастера создания целей, разделённые по функциональности.

## Структура компонентов

### ImageUploader.tsx

Компонент для загрузки и обработки изображений цели:

- Drag & Drop поддержка
- Превью изображения
- Обрезка изображения (React Image Crop)
- Валидация файлов (тип, размер)
- Управление состоянием изображения

**Props:**

- `image: File | null` - текущий файл изображения
- `onImageChange: (image: File | null) => void` - обработчик изменения изображения

### StepsManager.tsx

Компонент для управления шагами достижения цели:

- Добавление/удаление шагов
- Перетаскивание для изменения порядка (dnd-kit)
- Валидация минимального количества шагов
- Советы по планированию

**Props:**

- `steps: string[]` - массив текстов шагов
- `onStepsChange: (steps: string[]) => void` - обработчик изменения шагов
- `goalName: string` - название цели для отображения в резюме

## Использование

```tsx
import { ImageUploader, StepsManager } from './wizard';

// Компонент загрузки изображения
<ImageUploader
  image={data.image}
  onImageChange={(image) => update('image', image)}
/>

// Компонент управления шагами
<StepsManager
  steps={data.steps}
  onStepsChange={(steps) => update('steps', steps)}
  goalName={data.goalName}
/>
```

## Зависимости

### ImageUploader

- `react-image-crop` - для обрезки изображений
- `@fortawesome/react-fontawesome` - иконки
- `react-hot-toast` - уведомления об ошибках

### StepsManager

- `@dnd-kit/core` - drag & drop функциональность
- `@dnd-kit/sortable` - сортировка элементов
- `@fortawesome/react-fontawesome` - иконки

## Особенности

- Все компоненты используют TypeScript для типобезопасности
- Компоненты полностью изолированы и могут быть переиспользованы
- Используется последовательный UI/UX дизайн с основным приложением
- Поддержка всех необходимых интеракций (клавиатура, мышь, touch)
