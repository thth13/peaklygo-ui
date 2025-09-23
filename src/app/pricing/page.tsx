import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LeftSidebar } from '@/components/layout/sidebar';
import PricingClient from './pricingClient';
import { cookies } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pricing');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function PricingPage() {
  const cookieStore = await cookies();
  const myUserId = cookieStore.get('userId')?.value;

  return (
    <main className="max-w-7xl mx-auto mt-6 px-2 md:px-4 flex">
      <LeftSidebar userId={myUserId} />
      <PricingClient />
    </main>
  );
}
