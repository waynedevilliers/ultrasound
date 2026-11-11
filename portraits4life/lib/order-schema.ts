import { z } from 'zod';
import { canvasSizeIds } from '@/content/products';

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

const optionalText = (max: number) => z.string().trim().max(max).default('');

const shippingSchema = z.object({
  shippingFullName: z.string().trim().min(1).max(100),
  shippingStreet: z.string().trim().min(1).max(150),
  shippingCity: z.string().trim().min(1).max(100),
  shippingState: optionalText(100),
  shippingPostalCode: z.string().trim().min(1).max(20),
  shippingCountry: z.string().trim().min(1).max(100),
});

export const orderFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.email().max(254),
    product: z.enum(['digital', 'canvas']),
    canvasSize: z.string().default(''),
    childName: optionalText(60),
    weeksInWomb: z
      .string()
      .trim()
      .refine((value) => value === '' || (/^\d{1,2}$/.test(value) && Number(value) >= 1 && Number(value) <= 42), {
        message: 'weeksInWomb must be empty or between 1 and 42',
      })
      .default(''),
    specialRequests: optionalText(1000),
    // Honeypot: real visitors never fill this field.
    website: z.string().max(0).default(''),
    shippingFullName: z.string().default(''),
    shippingStreet: z.string().default(''),
    shippingCity: z.string().default(''),
    shippingState: z.string().default(''),
    shippingPostalCode: z.string().default(''),
    shippingCountry: z.string().default(''),
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
    } else if (value.canvasSize !== '') {
      ctx.addIssue({ code: 'custom', path: ['canvasSize'], message: 'Canvas size only applies to canvas prints' });
    }
  });

export type OrderFields = z.infer<typeof orderFieldsSchema>;

// Checks an uploaded file on the server. Returns an error message, or null when valid.
export function validateImageFile(file: FormDataEntryValue | null, required: boolean): string | null {
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
