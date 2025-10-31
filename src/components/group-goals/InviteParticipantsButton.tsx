'use client';

import { ReactNode, useState } from 'react';

import InviteParticipantsModal from './InviteParticipantsModal';

interface InviteParticipantsButtonProps {
  goalId: string;
  children: ReactNode;
  variant?: 'solid' | 'text';
  className?: string;
  onInvited?: (count: number) => void;
  ariaLabel?: string;
}

const variantClasses: Record<NonNullable<InviteParticipantsButtonProps['variant']>, string> = {
  solid:
    'inline-flex items-center rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  text: 'text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-60',
};

export function InviteParticipantsButton({
  goalId,
  children,
  variant = 'solid',
  className,
  onInvited,
  ariaLabel,
}: InviteParticipantsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  const handleInvited = (count: number) => {
    onInvited?.(count);
  };

  const buttonClassName = className ? `${variantClasses[variant]} ${className}` : variantClasses[variant];

  return (
    <>
      <button type="button" className={buttonClassName} onClick={() => setIsOpen(true)} aria-label={ariaLabel}>
        {children}
      </button>
      <InviteParticipantsModal goalId={goalId} isOpen={isOpen} onClose={handleClose} onInvited={handleInvited} />
    </>
  );
}

export default InviteParticipantsButton;
