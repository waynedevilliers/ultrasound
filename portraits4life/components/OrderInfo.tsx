import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function OrderInfo() {
  const infoSections = [
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
