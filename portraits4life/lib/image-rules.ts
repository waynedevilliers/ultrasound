// The photo rules shared by the browser and the server. Kept free of the validation library, so the
// order form does not load it.
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];
