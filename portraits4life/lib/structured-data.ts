import { canvasSizes, CURRENCY, digitalProduct } from '@/content/products';

// Structured data (schema.org). Built from escaped data only, and kept in one place.
export const ORGANIZATION_EMAIL = 'portraits4life.art@gmail.com';

export function organizationJsonLd(siteUrl?: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Portraits 4 Life',
    email: ORGANIZATION_EMAIL,
    ...(siteUrl ? { url: siteUrl } : {}),
  };
}

export function productJsonLd(name: string, description: string, locale: 'de' | 'en' = 'de'): Record<string, unknown> {
  const de = locale === 'de';
  const offers = [
    {
      '@type': 'Offer',
      name: de ? 'Digitales JPEG' : 'Digital JPEG',
      priceCurrency: CURRENCY,
      price: String(digitalProduct.priceFrom),
      lowPrice: String(digitalProduct.priceFrom),
      highPrice: String(digitalProduct.priceTo),
      availability: 'https://schema.org/InStock',
    },
    ...canvasSizes.map((size) => ({
      '@type': 'Offer',
      name: `${de ? 'Leinwand' : 'Canvas'} ${size.widthCm} × ${size.heightCm} cm`,
      priceCurrency: CURRENCY,
      price: String(size.price),
      availability: 'https://schema.org/InStock',
    })),
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: { '@type': 'Brand', name: 'Portraits 4 Life' },
    offers,
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Escapes "<" so the JSON cannot close the script tag early.
export function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
