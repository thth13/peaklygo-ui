'use client';
import { CongratulationsModal, useCongratulationsModal } from '@/components/CongratulationsModal';

export const CongratulationsModalClient = () => {
  const { isOpen, onClose } = useCongratulationsModal();

  return <CongratulationsModal isOpen={isOpen} onClose={onClose} />;
};
