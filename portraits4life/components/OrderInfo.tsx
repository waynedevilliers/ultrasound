import { getCopy, type Locale } from '@/lib/copy';
import Accordion from '@/components/Accordion';

// Information for the order page. Its rows use the same accordion as the FAQ.
export default function OrderInfo({ locale }: { locale: Locale }) {
  const { orderInfo } = getCopy(locale);

  return (
    <section className="mt-16">
      <h2 className="font-display heading-xl font-bold text-center mb-16 text-ink">
        {orderInfo.title}
      </h2>
      <Accordion
        items={orderInfo.sections.map((section) => ({
          question: section.title,
          content: (
            <ul className="space-y-3">
              {section.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex gap-3 text-base text-body">
                  <span className="text-brand mt-1" aria-hidden="true">
                    ›
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ),
        }))}
      />
    </section>
  );
}
