'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ViewModeContextType {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  showRightSidebar: boolean;
  isLoading: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

const STORAGE_KEY = 'view-mode';

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<'grid' | 'list'>('list');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY);
    if (savedMode === 'grid' || savedMode === 'list') {
      setViewModeState(savedMode);
    }
    setIsLoading(false);
  }, []);

  const setViewMode = (mode: 'grid' | 'list') => {
    setViewModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  const showRightSidebar = viewMode === 'list';

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, showRightSidebar, isLoading }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
