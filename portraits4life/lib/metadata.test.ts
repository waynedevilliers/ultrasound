import { describe, expect, it } from 'vitest';
import { pageMetadata, seoCopy } from './metadata';
import { breadcrumbJsonLd, organizationJsonLd, productJsonLd, safeJsonLd } from './structured-data';

describe('pageMetadata', () => {
  const meta = pageMetadata({ locale: 'de', path: '/order', title: 'Bestellen', description: 'Beschreibung' });

  it('sets title and description', () => {
    expect(meta.title).toBe('Bestellen');
    expect(meta.description).toBe('Beschreibung');
  });

  it('sets Open Graph and Twitter tags', () => {
    expect(meta.openGraph).toMatchObject({ title: 'Bestellen', locale: 'de_DE' });
    expect(meta.twitter).toMatchObject({ title: 'Bestellen' });
  });

  it('sets canonical and German and English alternates', () => {
    expect(meta.alternates?.canonical).toBe('/de/order');
    expect(meta.alternates?.languages).toMatchObject({ de: '/de/order', en: '/en/order' });
  });
});

describe('seo copy', () => {
  it('has a title and description for every page in both languages', () => {
    for (const locale of ['de', 'en']) {
      for (const key of ['home', 'order', 'impressum', 'datenschutz'] as const) {
        const copy = seoCopy(locale, key);
        expect(copy.title.length).toBeGreaterThan(0);
        expect(copy.description.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('structured data', () => {
  it('organization has name and email', () => {
    const org = organizationJsonLd();
    expect(org).toMatchObject({ '@type': 'Organization', name: 'Portraits 4 Life', email: 'portraits4life.art@gmail.com' });
  });

  it('product has one digital offer and one offer per canvas size', () => {
    const product = productJsonLd('Ultrasound art', 'desc') as { offers: unknown[] };
    expect(product.offers).toHaveLength(4);
  });

  it('breadcrumb items are numbered in order', () => {
    const crumbs = breadcrumbJsonLd([
      { name: 'Home', url: 'https://example.com/de' },
      { name: 'Bestellen', url: 'https://example.com/de/order' },
    ]) as { itemListElement: { position: number }[] };
    expect(crumbs.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });

  it('escapes < so the data cannot close the script tag', () => {
    expect(safeJsonLd({ name: '</script><b>' })).not.toContain('</script>');
  });
});
