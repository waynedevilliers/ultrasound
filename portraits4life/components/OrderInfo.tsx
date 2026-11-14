'use client';

import { usePathname } from 'next/navigation';
import { getCopy, localeOf } from '@/lib/copy';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function OrderInfo() {
  const pathname = usePathname();

  const { orderInfo } = getCopy(localeOf(pathname));
  const infoSections = orderInfo.sections;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-ink mb-8">
        {orderInfo.title}
      </h2>

      <Accordion className="w-full border border-line rounded-lg">
        {infoSections.map((section) => (
          <AccordionItem key={section.id} value={section.id}>
            <AccordionTrigger className="px-6 py-4 hover:bg-canvas">
              {section.title}
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4 bg-canvas">
              <ul className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex gap-3 text-body">
                    <span className="text-brand mt-1">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
