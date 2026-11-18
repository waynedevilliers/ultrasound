import { canvasSizes } from '@/content/products';
import { getCopy, type Locale } from '@/lib/copy';
import { canvasDeliveryText, digitalDeliveryText } from '@/lib/delivery';

// Product name in the page language, for example "Canvas print 30 × 30 cm".
export function productName(
  locale: Locale,
  product: 'digital' | 'canvas',
  canvasSizeId?: string,
): string {
  const { pricing } = getCopy(locale);
  if (product === 'digital') return pricing.digital.title;
  const size = canvasSizes.find((item) => item.id === canvasSizeId);
  return size
    ? `${pricing.canvas.title} ${size.widthCm} × ${size.heightCm} cm`
    : pricing.canvas.title;
}

export function deliveryText(locale: Locale, product: 'digital' | 'canvas'): string {
  return product === 'digital' ? digitalDeliveryText(locale) : canvasDeliveryText(locale);
}

// The confirmation email to the customer: plain text, in the language of the page the order was made on.
// The steps and the heading are the same words as on the success page.
export function buildCustomerEmail(input: {
  locale: Locale;
  name: string;
  reference: string;
  product: 'digital' | 'canvas';
  productLabel: string;
  delivery: string;
  contactEmail: string;
}): { subject: string; text: string } {
  const copy = getCopy(input.locale);
  const { customerEmail, orderForm } = copy;
  const lastStep = input.product === 'canvas' ? orderForm.nextStep3 : orderForm.nextStep3Digital;
  const lines = [
    customerEmail.greeting.replace('{name}', input.name),
    '',
    orderForm.successTitle,
    '',
    `${orderForm.referenceLabel} ${input.reference}`,
    `${customerEmail.product} ${input.productLabel}`,
    `${customerEmail.delivery} ${input.delivery}`,
    '',
    orderForm.nextStepsTitle,
    `1. ${orderForm.nextStep1}`,
    `2. ${orderForm.nextStep2}`,
    `3. ${lastStep}`,
    '',
    customerEmail.contact.replace('{email}', input.contactEmail),
    '',
    customerEmail.signoff,
    customerEmail.team,
  ];
  return { subject: customerEmail.subject, text: lines.join('\n') };
}
