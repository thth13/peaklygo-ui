declare module 'framer-motion' {
  import * as React from 'react';

  export const AnimatePresence: React.FC<{
    children?: React.ReactNode;
    mode?: 'sync' | 'wait' | 'popLayout';
    initial?: boolean;
    custom?: any;
    onExitComplete?: () => void;
  }>;

  export const motion: any;
  export function useReducedMotion(): boolean;
}
