import { z } from 'zod';
import { canvasSizeIds } from '@/content/products';
import { CONSENT_VERSION } from '@/lib/consent';
import { isShippingCountry, postalCodeIsValid } from '@/content/shipping';
import { isDigitalAvailable } from '@/content/products';

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/image-rules';

export { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES };

const optionalText = (max: number) => z.string().trim().max(max).default('');

const shippingSchema = z.object({
  shippingStreet: z.string().trim().min(1).max(150),
  shippingCity: z.string().trim().min(1).max(100),
  shippingPostalCode: z.string().trim().min(1).max(20),
  shippingCountry: z.string().trim().min(1).max(100),
  deliverToOther: z.boolean().default(false),
  shippingRecipient: optionalText(100),
});

export const orderFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.email().max(254),
    // The digital file is refused while it is not sold.
    product: z
      .enum(['digital', 'canvas'])
      .refine((product) => product !== 'digital' || isDigitalAvailable(), 'Product not available'),
    canvasSize: z.string().default(''),
    childName: optionalText(60),
    weeksInWomb: z
      .string()
      .trim()
      .refine(
        (value) =>
          value === '' || (/^\d{1,2}$/.test(value) && Number(value) >= 1 && Number(value) <= 42),
        {
          message: 'weeksInWomb must be empty or between 1 and 42',
        },
      )
      .default(''),
    specialRequests: optionalText(1000),
    // Honeypot: real visitors never fill this field.
    // Language of the page the order was made on; the customer's confirmation email uses it.
    locale: z.enum(['de', 'en']).default('de'),
    // Honeypot: any value is accepted here so the route can refuse it with its own check.
    website: z.string().default(''),
    shippingStreet: z.string().default(''),
    shippingCity: z.string().default(''),
    shippingPostalCode: z.string().default(''),
    shippingCountry: z.string().default(''),
    deliverToOther: z.boolean().default(false),
    shippingRecipient: z.string().default(''),
  })
  .superRefine((value, ctx) => {
    if (value.product === 'canvas') {
      if (!(canvasSizeIds as string[]).includes(value.canvasSize)) {
        ctx.addIssue({ code: 'custom', path: ['canvasSize'], message: 'Unknown canvas size' });
      }
      const shipping = shippingSchema.safeParse(value);
      if (!shipping.success) {
        for (const issue of shipping.error.issues) {
          ctx.addIssue({ code: 'custom', path: issue.path, message: issue.message });
        }
      }
      if (!isShippingCountry(value.shippingCountry)) {
        ctx.addIssue({ code: 'custom', path: ['shippingCountry'], message: 'Unknown country' });
      } else if (!postalCodeIsValid(value.shippingCountry, value.shippingPostalCode)) {
        ctx.addIssue({
          code: 'custom',
          path: ['shippingPostalCode'],
          message: 'Postal code is not valid for this country',
        });
      }
      if (value.deliverToOther && value.shippingRecipient === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['shippingRecipient'],
          message: 'Recipient name is required',
        });
      }
    } else if (value.canvasSize !== '') {
      ctx.addIssue({
        code: 'custom',
        path: ['canvasSize'],
        message: 'Canvas size only applies to canvas prints',
      });
    }
  });

// Checks an uploaded file on the server. Returns an error message, or null when valid.
export function validateImageFile(
  file: FormDataEntryValue | null,
  required: boolean,
): string | null {
  if (!file || typeof file === 'string' || file.size === 0) {
    return required ? 'Ultrasound image is required' : null;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image is larger than 15 MB';
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Image must be JPG, PNG, WebP or HEIC';
  }
  return null;
}

// Photos are uploaded to storage first; the order then carries their paths.
const storedPath = z
  .string()
  .regex(/^orders\/[A-Za-z0-9._-]+$/, 'Invalid file path')
  .max(200);

export const orderSubmitSchema = z.intersection(
  orderFieldsSchema,
  z.object({
    ultrasoundPath: storedPath,
    referencePath: storedPath.or(z.literal('')).default(''),
    // Explicit consent for health-related images: the two required boxes must be ticked.
    consent: z.object({
      processing: z.literal(true),
      rights: z.literal(true),
      showcase: z.boolean().default(false),
      version: z.literal(CONSENT_VERSION),
    }),
  }),
);

export type OrderSubmit = z.infer<typeof orderSubmitSchema>;

// Checks a stored photo's metadata on the server. Returns an error message, or null when valid.
export function validateStoredImage(meta: { size: number; contentType: string }): string | null {
  if (meta.size > MAX_IMAGE_BYTES) return 'Image is larger than 15 MB';
  if (!ALLOWED_IMAGE_TYPES.includes(meta.contentType))
    return 'Image must be JPG, PNG, WebP or HEIC';
  return null;
}
