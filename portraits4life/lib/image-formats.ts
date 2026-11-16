// The image formats the form accepts. The upload hint and the FAQ answer use this list.
// The validation itself is ALLOWED_IMAGE_TYPES in lib/order-schema.ts; keep the two in step.
export const IMAGE_FORMAT_LIST = {
  de: 'JPG, PNG, WebP oder HEIC',
  en: 'JPG, PNG, WebP or HEIC',
} as const;
