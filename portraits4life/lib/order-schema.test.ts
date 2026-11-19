import { CONSENT_VERSION } from './consent';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { digitalProduct } from '@/content/products';
import {
  MAX_IMAGE_BYTES,
  orderFieldsSchema,
  orderSubmitSchema,
  validateImageFile,
  validateStoredImage,
} from './order-schema';

// The field rules are tested with the digital file on sale; the availability tests turn it off.
beforeEach(() => {
  digitalProduct.available = true;
});
afterEach(() => {
  digitalProduct.available = false;
});

const digital = {
  name: 'Anna',
  email: 'anna@example.com',
  product: 'digital',
};

const canvas = {
  ...digital,
  product: 'canvas',
  canvasSize: '40x40cm',
  shippingStreet: 'Hauptstraße 1',
  shippingCity: 'Berlin',
  shippingPostalCode: '10115',
  shippingCountry: 'DE',
  deliverToOther: false,
  shippingRecipient: '',
};

describe('orderFieldsSchema', () => {
  it('accepts a valid digital order', () => {
    expect(orderFieldsSchema.safeParse(digital).success).toBe(true);
  });

  it('accepts a valid canvas order with a known size', () => {
    expect(orderFieldsSchema.safeParse(canvas).success).toBe(true);
  });

  it('rejects a canvas size that is not in the product file', () => {
    const result = orderFieldsSchema.safeParse({ ...canvas, canvasSize: '99x99cm' });
    expect(result.success).toBe(false);
  });

  it('rejects a canvas size on a digital order', () => {
    const result = orderFieldsSchema.safeParse({ ...digital, canvasSize: '30x30cm' });
    expect(result.success).toBe(false);
  });

  it('accepts a filled honeypot field for route-level rejection', () => {
    // The schema accepts the honeypot value; the order route refuses a filled honeypot.
    expect(orderFieldsSchema.safeParse({ ...digital, website: 'spam' }).success).toBe(true);
  });

  it('rejects an invalid email address', () => {
    expect(orderFieldsSchema.safeParse({ ...digital, email: 'not-an-email' }).success).toBe(false);
  });
});

describe('validateImageFile', () => {
  it('requires the ultrasound image', () => {
    expect(validateImageFile(null, true)).toBe('Ultrasound image is required');
  });

  it('allows a missing optional reference image', () => {
    expect(validateImageFile(null, false)).toBeNull();
  });

  it('rejects files over 15 MB', () => {
    const big = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'big.png', { type: 'image/png' });
    expect(validateImageFile(big, true)).toBe('Image is larger than 15 MB');
  });

  it('rejects non-image types', () => {
    const pdf = new File(['x'], 'scan.pdf', { type: 'application/pdf' });
    expect(validateImageFile(pdf, true)).toBe('Image must be JPG, PNG, WebP or HEIC');
  });

  it('accepts a small JPEG', () => {
    const jpg = new File(['x'], 'scan.jpg', { type: 'image/jpeg' });
    expect(validateImageFile(jpg, true)).toBeNull();
  });
});

describe('orderSubmitSchema', () => {
  const base = {
    ...digital,
    website: '',
    ultrasoundPath: 'orders/ultrasound-abc123',
    referencePath: '',
    consent: { processing: true, rights: true, showcase: false, version: CONSENT_VERSION },
  };

  it('accepts an order with a stored photo path', () => {
    expect(orderSubmitSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a photo path outside the orders folder', () => {
    expect(orderSubmitSchema.safeParse({ ...base, ultrasoundPath: '../secrets' }).success).toBe(
      false,
    );
  });

  it('rejects a missing ultrasound photo path', () => {
    expect(orderSubmitSchema.safeParse({ ...base, ultrasoundPath: '' }).success).toBe(false);
  });

  it('still enforces the field rules', () => {
    expect(orderSubmitSchema.safeParse({ ...base, email: 'bad' }).success).toBe(false);
  });
});

describe('validateStoredImage', () => {
  it('accepts a stored JPEG within the limit', () => {
    expect(validateStoredImage({ size: 1024, contentType: 'image/jpeg' })).toBeNull();
  });

  it('rejects a stored file over 15 MB', () => {
    expect(validateStoredImage({ size: MAX_IMAGE_BYTES + 1, contentType: 'image/png' })).toBe(
      'Image is larger than 15 MB',
    );
  });

  it('rejects a stored file that is not an allowed image', () => {
    expect(validateStoredImage({ size: 10, contentType: 'application/pdf' })).toBe(
      'Image must be JPG, PNG, WebP or HEIC',
    );
  });
});

describe('digital availability', () => {
  it('refuses a digital order while the digital file is not sold', () => {
    digitalProduct.available = false;
    expect(orderFieldsSchema.safeParse(digital).success).toBe(false);
  });

  it('accepts a digital order again when the digital file is made available', () => {
    digitalProduct.available = false;
    digitalProduct.available = true;
    expect(orderFieldsSchema.safeParse(digital).success).toBe(true);
  });

  it('accepts a canvas order while the digital file is not sold', () => {
    digitalProduct.available = false;
    expect(orderFieldsSchema.safeParse(canvas).success).toBe(true);
  });
});

describe('shipping address', () => {
  it('accepts a German address with a five-digit postal code', () => {
    expect(orderFieldsSchema.safeParse(canvas).success).toBe(true);
  });

  it('refuses a postal code that is not five digits', () => {
    expect(orderFieldsSchema.safeParse({ ...canvas, shippingPostalCode: '1234' }).success).toBe(
      false,
    );
    expect(orderFieldsSchema.safeParse({ ...canvas, shippingPostalCode: 'ABCDE' }).success).toBe(
      false,
    );
  });

  it('refuses an unknown country', () => {
    expect(orderFieldsSchema.safeParse({ ...canvas, shippingCountry: 'FR' }).success).toBe(false);
  });

  it('requires a recipient name when the order goes to another person', () => {
    expect(
      orderFieldsSchema.safeParse({ ...canvas, deliverToOther: true, shippingRecipient: '' })
        .success,
    ).toBe(false);
    expect(
      orderFieldsSchema.safeParse({
        ...canvas,
        deliverToOther: true,
        shippingRecipient: 'Oma Gisela',
      }).success,
    ).toBe(true);
  });
});
