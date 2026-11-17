import InfoCard from '@/components/InfoCard';

type OrderSuccessProps = {
  title: string;
  submitted: string;
  orderIdLabel: string;
  reference: string;
  contact: string;
};

// The message after a sent order. It uses the shared card and the site's own colors, not a status color.
export default function OrderSuccess({
  title,
  submitted,
  orderIdLabel,
  reference,
  contact,
}: OrderSuccessProps) {
  return (
    <InfoCard className="mx-auto max-w-2xl text-center">
      <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand-strong">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <h2 className="font-display heading-xl font-bold text-ink mb-6">{title}</h2>
      <p className="text-base text-body mb-4">{submitted}</p>
      <p className="text-base text-body mb-4">
        <strong className="font-bold text-ink">{orderIdLabel}</strong>{' '}
        <span className="whitespace-nowrap">{reference}</span>
      </p>
      <p className="text-base text-body">{contact}</p>
    </InfoCard>
  );
}
