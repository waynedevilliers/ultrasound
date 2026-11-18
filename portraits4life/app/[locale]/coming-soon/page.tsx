import ComingSoon from '@/components/ComingSoon';

// Every site request is rewritten here while COMING_SOON=true (see middleware.ts).
export default async function ComingSoonPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ComingSoon locale={locale} />;
}
