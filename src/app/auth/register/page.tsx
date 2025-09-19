import AuthForm from '@/components/AuthForm';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageEvent from '@/components/analytics/PageEvent';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('authMeta');
  return {
    title: t('registerTitle'),
    description: t('registerDescription'),
  };
}

export default function RegisterPage() {
  return (
    <>
      <PageEvent name="register_page_open" params={{ location: 'auth/register' }} />
      <AuthForm isLoginProp={false} />
    </>
  );
}
