import { canvasSizes } from '@/content/products';
import { getCopy, type Locale } from '@/lib/copy';
import { canvasDeliveryText, digitalDeliveryText } from '@/lib/delivery';
import { escapeHtml } from '@/lib/escape-html';

// The confirmation email to the customer. It is written in the language of the page the order was made on.

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

export function buildCustomerEmail(input: {
  locale: Locale;
  name: string;
  reference: string;
  product: string;
  delivery: string;
}): { subject: string; html: string } {
  const { customerEmail } = getCopy(input.locale);
  const row = (label: string, value: string) =>
    `<p><strong>${escapeHtml(label)}</strong> ${escapeHtml(value)}</p>`;
  const html = `
    <h2>${escapeHtml(customerEmail.heading)}</h2>
    <p>${escapeHtml(customerEmail.greeting.replace('{name}', input.name))}</p>
    <p>${escapeHtml(customerEmail.intro)}</p>
    ${row(customerEmail.reference, input.reference)}
    ${row(customerEmail.product, input.product)}
    ${row(customerEmail.delivery, input.delivery)}
    <p>${escapeHtml(customerEmail.contact)}</p>
    <p>${escapeHtml(customerEmail.signoff)}<br/>${escapeHtml(customerEmail.team)}</p>
  `;
  return { subject: customerEmail.subject, html };
}
