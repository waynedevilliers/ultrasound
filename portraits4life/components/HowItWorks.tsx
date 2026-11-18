import { getCopy, type Locale } from '@/lib/copy';
import { isDigitalAvailable } from '@/content/products';
import InfoCard from '@/components/InfoCard';
import ActionLink from '@/components/ActionLink';

// TODO(client): approve the three step titles and descriptions (DE and EN; the wording is new).
// TODO(client): confirm the payment order (paid after the image is checked) before launch.
export default function HowItWorks({ locale }: { locale: Locale }) {
  const { howItWorks, common } = getCopy(locale);
  // While the digital file is not sold, the last step names only the canvas.
  const steps = isDigitalAvailable()
    ? howItWorks.steps
    : howItWorks.steps.map((step, index) => (index === 2 ? howItWorks.canvasOnlyStep : step));

  return (
    <section id="so-funktionierts" className="section-y bg-canvas">
      <div className="container-site">
        <h2 className="font-display heading-xl font-bold text-center mb-20 text-ink">
          {howItWorks.title}
        </h2>

        <ol className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <InfoCard as="li" key={step.title}>
              <span
                aria-hidden="true"
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint font-display text-xl font-bold text-brand-strong"
              >
                {index + 1}
              </span>
              <h3 className="text-xl font-bold mb-3 text-ink">{step.title}</h3>
              <p className="text-base text-copy leading-relaxed">{step.description}</p>
            </InfoCard>
          ))}
        </ol>

        <p className="mt-10 text-center text-base text-copy">{howItWorks.paymentNote}</p>
        <div className="mt-8 text-center">
          <ActionLink href={`/${locale}/order`} variant="secondary">
            {common.orderNow}
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
