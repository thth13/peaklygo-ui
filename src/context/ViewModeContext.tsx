'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ViewModeContextType {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  showRightSidebar: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // RightSidebar скрывается только в режиме плитки
  const showRightSidebar = viewMode === 'list';

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, showRightSidebar }}>{children}</ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
