import AuthForm from '@/components/AuthForm';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('authMeta');
  return {
    title: t('registerTitle'),
    description: t('registerDescription'),
  };
}

const PageEvent = dynamic(() => import('@/components/analytics/PageEvent'), { ssr: false });

export default function RegisterPage() {
  return (
    <>
      <PageEvent name="register_page_open" params={{ location: 'auth/register' }} />
      <AuthForm isLoginProp={false} />
    </>
  );
}
