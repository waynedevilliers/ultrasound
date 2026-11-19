import { DEFAULT_SHIPPING_COUNTRY, isShippingCountry, postalCodeIsValid } from '@/content/shipping';
import { CONSENT_VERSION } from '@/lib/consent';

// Empty values for every field except product and size, which may come from the URL.
export const EMPTY_FORM = {
  name: '',
  email: '',
  product: 'canvas',
  canvasSize: '30x30cm',
  childName: '',
  weeksInWomb: '',
  specialRequests: '',
  shippingStreet: '',
  shippingCity: '',
  shippingPostalCode: '',
  shippingCountry: DEFAULT_SHIPPING_COUNTRY as string,
  deliverToOther: false as boolean,
  shippingRecipient: '',
} as const;

export type OrderFormData = {
  -readonly [K in keyof typeof EMPTY_FORM]: (typeof EMPTY_FORM)[K] extends boolean ? boolean : string;
};

export type OrderConsent = { processing: boolean; rights: boolean; showcase: boolean };

// A failed step of the submit, so the message can say what went wrong.
// 'invalid' is a rejected order that names no field (such as a bot check); 'rate' is too many attempts.
export type OrderStage = 'upload' | 'network' | 'server' | 'invalid' | 'rate';

export class OrderStageError extends Error {
  constructor(
    public stage: OrderStage,
    public code?: string,
  ) {
    super(stage);
  }
}

export type ServerReply = {
  reference?: string;
  confirmationSent?: boolean;
  message?: string;
  code?: string;
  issues?: { field: string; message: string }[];
};

// Reads the reply body. A body that cannot be read is a failure, never a success: on a successful
// response it means the confirmation is missing; on an error response (for example a gateway page)
// the error status is enough to report, so the reply is treated as empty.
export async function readReply(response: Response, requestCode: string): Promise<ServerReply> {
  try {
    return (await response.json()) as ServerReply;
  } catch (error) {
    if (response.ok) {
      throw new OrderStageError(error instanceof TypeError ? 'network' : 'server', requestCode);
    }
    return {};
  }
}

type MissingFieldMessages = {
  requiredField: string;
  fieldInvalid: string;
  ultrasoundRequired: string;
  consentRequired: string;
};

// The browser-side check before anything is uploaded: every missing or invalid field, keyed by field name.
// The server checks the same rules again.
export function findMissingFields(
  formData: OrderFormData,
  hasUltrasound: boolean,
  consent: OrderConsent,
  messages: MissingFieldMessages,
): Record<string, string> {
  const required: (keyof OrderFormData)[] = ['name', 'email'];
  if (formData.product === 'canvas') {
    required.push('shippingStreet', 'shippingCity', 'shippingPostalCode');
    if (formData.deliverToOther) required.push('shippingRecipient');
  }
  const missing: Record<string, string> = {};
  for (const key of required) {
    if (!String(formData[key]).trim()) missing[key] = messages.requiredField;
  }
  if (formData.email.trim() && !formData.email.includes('@')) missing.email = messages.fieldInvalid;
  if (
    formData.product === 'canvas' &&
    isShippingCountry(formData.shippingCountry) &&
    formData.shippingPostalCode.trim() !== '' &&
    !postalCodeIsValid(formData.shippingCountry, formData.shippingPostalCode.trim())
  )
    missing.shippingPostalCode = messages.fieldInvalid;
  if (!hasUltrasound) missing.ultrasound = messages.ultrasoundRequired;
  if (!consent.processing) missing.consentProcessing = messages.consentRequired;
  if (!consent.rights) missing.consentRights = messages.consentRequired;
  return missing;
}

// The body sent to /api/orders. The two required consents are true here because the form only sends
// after they are ticked. Shipping fields are sent for a canvas only.
export function buildOrderPayload(
  formData: OrderFormData,
  consent: OrderConsent,
  meta: {
    website: string;
    requestCode: string;
    locale: string;
    ultrasoundPath: string;
    referencePath: string;
  },
) {
  return {
    name: formData.name,
    email: formData.email,
    product: formData.product,
    childName: formData.childName,
    weeksInWomb: formData.weeksInWomb,
    specialRequests: formData.specialRequests,
    consent: {
      processing: true,
      rights: true,
      showcase: consent.showcase,
      version: CONSENT_VERSION,
    },
    ...meta,
    ...(formData.product === 'canvas'
      ? {
          canvasSize: formData.canvasSize,
          shippingStreet: formData.shippingStreet,
          shippingCity: formData.shippingCity,
          shippingPostalCode: formData.shippingPostalCode,
          shippingCountry: formData.shippingCountry,
          deliverToOther: formData.deliverToOther,
          shippingRecipient: formData.shippingRecipient,
        }
      : {}),
  };
}
