'use client';

import { useTranslations } from 'next-intl';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function OrderInfo() {
  const t = useTranslations('order.info');

  const infoSections = [
    {
      id: 'ultrasound',
      title: t('ultrasound.title'),
      items: [
        t('ultrasound.item1'),
        t('ultrasound.item2'),
        t('ultrasound.item3'),
      ],
    },
    {
      id: 'individual',
      title: t('individual.title'),
      items: [
        t('individual.item1'),
        t('individual.item2'),
      ],
    },
    {
      id: 'couple',
      title: t('couple.title'),
      items: [
        t('couple.item1'),
        t('couple.item2'),
        t('couple.item3'),
      ],
    },
    {
      id: 'payment',
      title: t('payment.title'),
      items: [
        t('payment.description'),
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Information</h2>

      <Accordion className="w-full border border-gray-200 rounded-lg">
        {infoSections.map((section, idx) => (
          <AccordionItem key={section.id} value={section.id}>
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              {section.title}
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4 bg-gray-50">
              <ul className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex gap-3 text-gray-700">
                    <span className="text-pink-500 mt-1">›</span>
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
