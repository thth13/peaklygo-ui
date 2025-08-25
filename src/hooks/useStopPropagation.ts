import { useCallback } from 'react';

type EventHandler<T = HTMLElement> = (e: React.MouseEvent<T>) => void | Promise<void>;

export const useStopPropagation = () => {
  const stopPropagation = useCallback(<T = HTMLElement>(handler?: EventHandler<T>): EventHandler<T> => {
    return (e: React.MouseEvent<T>) => {
      e.preventDefault();
      e.stopPropagation();
      if (handler) {
        handler(e);
      }
    };
  }, []);

  return { stopPropagation };
};
