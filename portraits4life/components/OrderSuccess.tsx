import ActionLink from '@/components/ActionLink';

// The one heading of the success state; the form and the section use this id to focus and scroll to it.
export const SUCCESS_HEADING_ID = 'order-success-heading';

type OrderSuccessProps = {
  title: string;
  referenceLabel: string;
  reference: string;
  nextStepsTitle: string;
  steps: string[];
  // Only set when the confirmation email was accepted by the mail service.
  confirmation?: string;
  backHome: string;
  homeHref: string;
};

// The message after a sent order. It uses the shared card and the site's own colors, not a status color.
export default function OrderSuccess({
  title,
  referenceLabel,
  reference,
  nextStepsTitle,
  steps,
  confirmation,
  backHome,
  homeHref,
}: OrderSuccessProps) {
  return (
    <div className="mx-auto text-center">
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
      <h1
        id={SUCCESS_HEADING_ID}
        tabIndex={-1}
        className="font-display heading-xl font-bold text-ink mb-6 outline-none focus-visible:outline-2 focus-visible:outline-brand"
      >
        {title}
      </h1>
      <div className="mx-auto max-w-[560px]">
        <p className="text-base text-body mb-4">
          <strong className="font-bold text-ink">{referenceLabel}</strong>{' '}
          <span className="whitespace-nowrap">{reference}</span>
        </p>
        {confirmation && <p className="text-base text-body mb-6">{confirmation}</p>}
        <div className="mx-auto mb-8 max-w-md text-left">
          <p className="mb-3 text-base font-bold text-ink">{nextStepsTitle}</p>
          <ol className="list-decimal space-y-3 pl-6 text-base text-body">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
      <ActionLink href={homeHref} variant="secondary">
        {backHome}
      </ActionLink>
    </div>
  );
}
