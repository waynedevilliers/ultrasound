import { getCopy } from '@/lib/copy';

// Shown instead of the site while COMING_SOON=true. Plain text, no links, no images.
export default function ComingSoon({ locale }: { locale: string }) {
  const { comingSoon } = getCopy(locale === 'de' ? 'de' : 'en');
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-surface px-6 text-center">
      <h1 className="font-display heading-xl mb-4 font-bold text-ink">{comingSoon.title}</h1>
      <p className="max-w-md text-lg text-copy">{comingSoon.text}</p>
    </main>
  );
}
