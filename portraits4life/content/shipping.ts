// Countries an order can be delivered to. Only Germany for now.
// TODO(client): other countries and their shipping costs before launch.
export const shippingCountries = [
  { code: 'DE', labels: { de: 'Deutschland', en: 'Germany' }, postalCode: /^\d{5}$/ },
] as const;

export type ShippingCountryCode = (typeof shippingCountries)[number]['code'];
export const DEFAULT_SHIPPING_COUNTRY: ShippingCountryCode = 'DE';

export function isShippingCountry(value: string): value is ShippingCountryCode {
  return shippingCountries.some((country) => country.code === value);
}

export function shippingCountryLabel(code: ShippingCountryCode, locale: 'de' | 'en'): string {
  const country = shippingCountries.find((item) => item.code === code);
  return country ? country.labels[locale] : code;
}

export function postalCodeIsValid(code: ShippingCountryCode, postalCode: string): boolean {
  const country = shippingCountries.find((item) => item.code === code);
  return country ? country.postalCode.test(postalCode) : false;
}
