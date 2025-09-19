import AuthForm from '@/components/AuthForm';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageEvent from '@/components/analytics/PageEvent';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('authMeta');
  return {
    title: t('loginTitle'),
    description: t('loginDescription'),
  };
}

export default function LoginPage() {
  return (
    <>
      <PageEvent name="login_page_open" params={{ location: 'auth/login' }} />
      <AuthForm isLoginProp={true} />
    </>
  );
}
