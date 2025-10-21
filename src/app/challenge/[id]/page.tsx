import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ChallengeHeader from '@/components/challenge/ChallengeHeader';
import ChallengeOverview from '@/components/challenge/ChallengeOverview';
import ChallengeProgressTable from '@/components/challenge/ChallengeProgressTable';
import ChallengeChat from '@/components/challenge/ChallengeChat';
import ChallengeStats from '@/components/challenge/ChallengeStats';
import ParticipantsList from '@/components/challenge/ParticipantsList';
import { Challenge } from '@/types';

interface ChallengePageProps {
  params: Promise<{ id: string }>;
}

async function getChallengeData(id: string): Promise<Challenge | null> {
  // TODO: Implement API call
  // Временные данные для демонстрации
  return {
    id,
    name: '30 дней без сахара',
    description:
      'Групповой вызов на 30 дней полного отказа от сахара. Участники поддерживают друг друга и отмечают каждый день своего прогресса.',
    category: 'Здоровье',
    status: 'active',
    currentDay: 15,
    totalDays: 30,
    participantsCount: 12,
    activeParticipantsCount: 8,
    overallSuccessRate: 73,
    createdAt: new Date('2025-10-01'),
  };
}

export async function generateMetadata({ params }: ChallengePageProps): Promise<Metadata> {
  const { id } = await params;
  const challenge = await getChallengeData(id);

  if (!challenge) {
    return {
      title: 'Челлендж не найден',
    };
  }

  return {
    title: `${challenge.name} — PeaklyGo`,
    description: challenge.description,
  };
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const { id } = await params;
  const challenge = await getChallengeData(id);

  if (!challenge) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <ChallengeHeader challenge={challenge} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ChallengeOverview challenge={challenge} />
          <ChallengeProgressTable challengeId={id} />
          <ChallengeChat challengeId={id} />
        </div>

        <div className="space-y-6">
          <ChallengeStats challengeId={id} />
          <ParticipantsList challengeId={id} />
        </div>
      </div>
    </div>
  );
}
