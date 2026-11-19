import { describe, expect, it } from 'vitest';
import { CONSENT_VERSION } from '@/lib/consent';
import {
  EMPTY_FORM,
  OrderStageError,
  buildOrderPayload,
  findMissingFields,
  readReply,
  type OrderFormData,
} from './order-submit';

const messages = {
  requiredField: 'required',
  fieldInvalid: 'invalid',
  ultrasoundRequired: 'photo',
  consentRequired: 'consent',
};
const allConsent = { processing: true, rights: true, showcase: false };

function form(changes: Partial<OrderFormData> = {}): OrderFormData {
  return {
    ...EMPTY_FORM,
    name: 'Ann',
    email: 'ann@example.com',
    shippingStreet: 'Hauptstraße 1',
    shippingCity: 'Berlin',
    shippingPostalCode: '10115',
    ...changes,
  };
}

describe('findMissingFields', () => {
  it('finds nothing for a complete canvas order', () => {
    expect(findMissingFields(form(), true, allConsent, messages)).toEqual({});
  });

  it('marks every empty required field, the photo and both required consents', () => {
    const missing = findMissingFields(
      { ...EMPTY_FORM },
      false,
      { processing: false, rights: false, showcase: false },
      messages,
    );
    expect(missing).toEqual({
      name: 'required',
      email: 'required',
      shippingStreet: 'required',
      shippingCity: 'required',
      shippingPostalCode: 'required',
      ultrasound: 'photo',
      consentProcessing: 'consent',
      consentRights: 'consent',
    });
  });

  it('asks for the recipient only when delivering to someone else', () => {
    expect(findMissingFields(form({ deliverToOther: true }), true, allConsent, messages)).toEqual({
      shippingRecipient: 'required',
    });
  });

  it('does not ask for an address for the digital file', () => {
    const digital = form({ product: 'digital', shippingStreet: '', shippingCity: '' });
    expect(findMissingFields(digital, true, allConsent, messages)).toEqual({});
  });

  it('marks an email without @ and a German postal code that is not five digits', () => {
    const missing = findMissingFields(
      form({ email: 'ann', shippingPostalCode: '123' }),
      true,
      allConsent,
      messages,
    );
    expect(missing).toEqual({ email: 'invalid', shippingPostalCode: 'invalid' });
  });
});

describe('buildOrderPayload', () => {
  const meta = {
    website: '',
    requestCode: 'abcd1234',
    locale: 'de',
    ultrasoundPath: 'orders/ultrasound/a.png',
    referencePath: '',
  };

  it('sends the shipping fields for a canvas, with the consent version', () => {
    const payload = buildOrderPayload(form(), { ...allConsent, showcase: true }, meta);
    // Exact match, so a field that is dropped or added by mistake fails the test.
    expect(payload).toEqual({
      name: 'Ann',
      email: 'ann@example.com',
      product: 'canvas',
      childName: '',
      weeksInWomb: '',
      specialRequests: '',
      consent: { processing: true, rights: true, showcase: true, version: CONSENT_VERSION },
      ...meta,
      canvasSize: '30x30cm',
      shippingStreet: 'Hauptstraße 1',
      shippingCity: 'Berlin',
      shippingPostalCode: '10115',
      shippingCountry: 'DE',
      deliverToOther: false,
      shippingRecipient: '',
    });
  });

  it('leaves out the shipping fields for the digital file', () => {
    const payload = buildOrderPayload(form({ product: 'digital' }), allConsent, meta);
    expect(payload).not.toHaveProperty('shippingStreet');
    expect(payload).not.toHaveProperty('canvasSize');
  });
});

describe('readReply', () => {
  it('treats an unreadable error reply as empty', async () => {
    const reply = await readReply(new Response('<html>', { status: 502 }), 'abcd1234');
    expect(reply).toEqual({});
  });

  it('fails a successful reply that cannot be read, keeping the request code', async () => {
    const failure = readReply(new Response('<html>', { status: 200 }), 'abcd1234');
    await expect(failure).rejects.toBeInstanceOf(OrderStageError);
    await expect(failure).rejects.toMatchObject({ stage: 'server', code: 'abcd1234' });
  });
});
