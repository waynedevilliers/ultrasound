'use client';

import { usePathname } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function OrderInfo() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');

  const infoSections = isDE ? [
    {
      id: 'ultrasound',
      title: 'Ultraschallportraits',
      items: [
        'Wähle ein klares Ultraschallbild - Profilaufnahmen funktionieren am besten',
        'Wir benachrichtigen dich innerhalb von 24 Stunden, ob das Bild verwendbar ist',
        'Falls nicht geeignet, kannst du ein anderes Bild kostenlos erneut einreichen',
      ],
    },
    {
      id: 'individual',
      title: 'Individualportraits',
      items: [
        'Wähle ein klares Foto der Person (300dpi bevorzugt)',
        'Wir bestätigen, ob das Foto unsere Qualitätsanforderungen erfüllt',
      ],
    },
    {
      id: 'couple',
      title: 'Paarportraits',
      items: [
        'Ein Profilfoto pro Person - muss kein gemeinsames Foto sein',
        '300dpi Qualität bevorzugt für beste Ergebnisse',
        'Wir benachrichtigen dich, wenn wir angepasste Bilder benötigen',
      ],
    },
    {
      id: 'payment',
      title: 'Zahlung',
      items: [
        'Nach der Bestätigung kannst du per PayPal, Banküberweisung oder Kreditkarte zahlen',
        'Der Zahlungslink wird dir per E-Mail zugesandt',
      ],
    },
  ] : [
    {
      id: 'ultrasound',
      title: 'Ultrasound Portraits',
      items: [
        'Choose a clear ultrasound image - profile views work best',
        'We notify you within 24 hours if the image is usable',
        'If not suitable, you can resubmit another image at no extra cost',
      ],
    },
    {
      id: 'individual',
      title: 'Individual Portraits',
      items: [
        'Choose a clear photo of the person (300dpi preferred)',
        'We confirm if the photo meets our quality requirements',
      ],
    },
    {
      id: 'couple',
      title: 'Couple Portraits',
      items: [
        'One profile photo per person - doesn\'t need to be a joint photo',
        '300dpi quality preferred for best results',
        'We\'ll notify you if we need adjusted images',
      ],
    },
    {
      id: 'payment',
      title: 'Payment',
      items: [
        'After confirmation, you can pay via PayPal, bank transfer, or credit card',
        'Payment link will be sent via email',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        {isDE ? 'Informationen' : 'Information'}
      </h2>

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
