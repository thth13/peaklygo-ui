import AuthForm from '@/components/AuthForm';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('authMeta');
  return {
    title: t('loginTitle'),
    description: t('loginDescription'),
  };
}

const PageEvent = dynamic(() => import('@/components/analytics/PageEvent'), { ssr: false });

export default function LoginPage() {
  return (
    <>
      <PageEvent name="login_page_open" params={{ location: 'auth/login' }} />
      <AuthForm isLoginProp={true} />
    </>
  );
}
