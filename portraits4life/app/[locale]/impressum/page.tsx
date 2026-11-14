import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { pageMetadata, seoCopy } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({ locale, path: '/impressum', ...seoCopy(locale, 'impressum') });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage locale={locale} page="impressum" />;
}
