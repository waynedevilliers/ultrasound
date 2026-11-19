'use client';

import { useEffect, useRef, useState } from 'react';
import { formatOptions } from '@/lib/format-options';
import { isCanvasSizeId } from '@/content/products';
import { shippingCountries } from '@/content/shipping';
import { buttonClasses } from '@/components/ActionLink';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/image-rules';
import { usePathname } from 'next/navigation';
import type { FormatChoice } from '@/lib/format-param';
import { getCopy, localeOf } from '@/lib/copy';
import Link from 'next/link';
import { routeHref, routes } from '@/content/routes';
import { clearFieldError, fieldErrorsFromIssues } from '@/lib/form-errors';
import UploadArea from '@/components/UploadArea';
import OrderSuccess, { SUCCESS_HEADING_ID } from '@/components/OrderSuccess';
import {
  CheckboxField,
  Field,
  FieldError,
  TextField,
  fieldClass,
  invalidProps,
} from '@/components/FormFields';
import { IMAGE_FORMAT_LIST } from '@/lib/image-formats';
import { createRequestCode } from '@/lib/request-code';
import {
  EMPTY_FORM,
  OrderStageError,
  buildOrderPayload,
  findMissingFields,
  readReply,
  type OrderConsent,
  type OrderFormData,
} from '@/lib/order-submit';
import { upload } from '@vercel/blob/client';

type PhotoType = 'ultrasound' | 'reference';

export default function OrderForm({
  initialFormat = null,
  onSentChange,
}: {
  initialFormat?: FormatChoice | null;
  // Tells the page the order was sent (with the text to announce); an empty text means not sent.
  onSentChange?: (announcement: string) => void;
}) {
  const pathname = usePathname();
  const locale = localeOf(pathname);
  const copy = getCopy(locale);
  const orderForm = copy.orderForm;
  const privacyRoute = routes.find((route) => route.id === 'datenschutz');
  const privacyHref = privacyRoute ? routeHref(locale, privacyRoute) : `/${locale}/datenschutz`;

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  // Errors for single fields, keyed by field name; cleared when the field changes.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Consent boxes, unticked by default. Only processing and rights are required.
  const [consent, setConsent] = useState<OrderConsent>({
    processing: false,
    rights: false,
    showcase: false,
  });
  // Screen readers announce the summary (role=alert); focus moves there after a failed submit.
  const summaryRef = useRef<HTMLDivElement>(null);
  // After sending, focus moves to the success message. The page scrolls to it once its layout has changed.
  useEffect(() => {
    if (error) summaryRef.current?.focus();
  }, [error]);
  const [reference, setReference] = useState('');
  // The address the confirmation was sent to; null when the mail service did not accept it.
  const [confirmationTo, setConfirmationTo] = useState<string | null>(null);
  // The product of the sent order, so the success steps describe what really happens next.
  const [submittedProduct, setSubmittedProduct] = useState<'digital' | 'canvas'>('canvas');
  useEffect(() => {
    if (!submitted) return;
    onSentChange?.(`${orderForm.successTitle} ${orderForm.referenceLabel} ${reference}`);
    document.getElementById(SUCCESS_HEADING_ID)?.focus({ preventScroll: true });
  }, [submitted, onSentChange, orderForm.successTitle, orderForm.referenceLabel, reference]);

  const [formData, setFormData] = useState<OrderFormData>({
    ...EMPTY_FORM,
    product: initialFormat?.product ?? 'canvas',
    canvasSize: initialFormat?.product === 'canvas' ? initialFormat.canvasSize : '30x30cm',
  });

  const [files, setFiles] = useState<Record<PhotoType, File | null>>({
    ultrasound: null,
    reference: null,
  });

  // The product list sets both the product and the canvas size.
  const formatValue = formData.product === 'canvas' ? formData.canvasSize : 'digital';
  // The select cuts long labels on small phones, so the price is repeated as text below it.
  const options = formatOptions(locale);
  const selectedPrice = options.find((option) => option.value === formatValue)?.price;
  // A size error from the server is shown on the same list.
  const formatErrorKey = fieldErrors.canvasSize ? 'canvasSize' : 'product';
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => {
      if (value === 'digital') return { ...prev, product: 'digital' };
      return isCanvasSizeId(value) ? { ...prev, product: 'canvas', canvasSize: value } : prev;
    });
    setFieldErrors((prev) => clearFieldError(clearFieldError(prev, 'product'), 'canvasSize'));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFieldErrors((prev) => clearFieldError(prev, name));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: PhotoType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const problem =
      file.size > MAX_IMAGE_BYTES
        ? orderForm.fileTooLarge
        : !ALLOWED_IMAGE_TYPES.includes(file.type)
          ? orderForm.fileType
          : '';
    if (problem) {
      setError(problem);
      setFieldErrors((prev) => ({ ...prev, [type]: problem }));
      e.target.value = '';
      return;
    }
    setError('');
    setFieldErrors((prev) => clearFieldError(prev, type));
    setFiles((prev) => ({ ...prev, [type]: file }));
  };

  // Removes a chosen photo and its error.
  const handleRemoveFile = (type: PhotoType) => {
    setFiles((prev) => ({ ...prev, [type]: null }));
    setFieldErrors((prev) => clearFieldError(prev, type));
  };

  const uploadCopy = {
    choose: orderForm.chooseImage,
    formats: orderForm.imageFormats.replace(
      '{formats}',
      IMAGE_FORMAT_LIST[locale === 'de' ? 'de' : 'en'],
    ),
    remove: orderForm.removeImage,
  };

  // Photos go straight from the browser to private storage. The order then carries only their paths.
  // The request code travels with the upload, so the server logs for this upload carry the code shown here.
  const uploadPhoto = async (file: File, prefix: string, requestCode: string): Promise<string> => {
    try {
      const stored = await upload(`orders/${prefix}`, file, {
        access: 'private',
        handleUploadUrl: '/api/orders/upload',
        contentType: file.type,
        clientPayload: requestCode,
      });
      return stored.pathname;
    } catch (error) {
      console.error('Photo upload failed', error);
      throw new OrderStageError('upload', requestCode);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      // Required fields are checked here too, so an empty submit marks every missing field.
      const missing = findMissingFields(formData, files.ultrasound !== null, consent, orderForm);
      if (Object.keys(missing).length > 0) {
        setFieldErrors(missing);
        setError(orderForm.checkFields);
        return;
      }
      if (!files.ultrasound) return;

      // Honeypot: hidden from visitors, must stay empty.
      const honeypot =
        (e.currentTarget.elements.namedItem('website') as HTMLInputElement | null)?.value ?? '';

      // One code per attempt: shown if the upload fails, and sent with the order.
      const requestCode = createRequestCode();
      const ultrasoundPath = await uploadPhoto(files.ultrasound, 'ultrasound', requestCode);
      const referencePath = files.reference
        ? await uploadPhoto(files.reference, 'reference', requestCode)
        : '';

      const payload = buildOrderPayload(formData, consent, {
        website: honeypot,
        requestCode,
        locale,
        ultrasoundPath,
        referencePath,
      });

      let response: Response;
      try {
        response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        // The request may have reached the server, so the code is kept for the visitor to quote.
        throw new OrderStageError('network', requestCode);
      }

      const data = await readReply(response, requestCode);

      if (response.status === 429) throw new OrderStageError('rate');

      if (!response.ok) {
        const issues = Array.isArray(data.issues) ? data.issues : [];
        const errors = fieldErrorsFromIssues(issues, orderForm.fieldInvalid);
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          setError(orderForm.checkFields);
          return;
        }
        // Server errors (5xx) are our fault and carry the code; other rejections (4xx) get the generic text.
        if (response.status >= 500) throw new OrderStageError('server', requestCode);
        throw new OrderStageError('invalid');
      }

      // A reply without a reference is not a confirmed order, so it is shown as a failure.
      const confirmed = typeof data.reference === 'string' ? data.reference : '';
      if (!confirmed) throw new OrderStageError('server', requestCode);
      setReference(confirmed);
      setConfirmationTo(data.confirmationSent === true ? formData.email.trim() : null);
      setSubmitted(true);
      setSubmittedProduct(formData.product === 'canvas' ? 'canvas' : 'digital');
      setFormData(EMPTY_FORM);
      setFiles({ ultrasound: null, reference: null });
    } catch (err) {
      console.error('Order submit failed', err);
      if (err instanceof OrderStageError) {
        const messages = {
          upload: orderForm.uploadFailed,
          network: orderForm.networkError,
          server: orderForm.serverError,
          invalid: orderForm.genericError,
          rate: orderForm.tooManyRequests,
        };
        const base = messages[err.stage];
        setError(err.code ? `${base} ${orderForm.errorCode.replace('{code}', err.code)}` : base);
      } else {
        setError(orderForm.genericError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <OrderSuccess
        title={orderForm.successTitle}
        referenceLabel={orderForm.referenceLabel}
        reference={reference}
        nextStepsTitle={orderForm.nextStepsTitle}
        steps={[
          orderForm.nextStep1,
          orderForm.nextStep2,
          submittedProduct === 'canvas' ? orderForm.nextStep3 : orderForm.nextStep3Digital,
        ]}
        confirmation={
          confirmationTo ? orderForm.confirmationSent.replace('{email}', confirmationTo) : undefined
        }
        backHome={orderForm.backHome}
        homeHref={`/${locale}`}
      />
    );
  }

  // Props shared by the text fields: value and error come from the form state by field name.
  const text = (id: keyof OrderFormData) => ({
    id,
    value: String(formData[id]),
    onChange: handleChange,
    error: fieldErrors[id],
  });

  return (
    // noValidate: the browser's own required-field bubbles would hide our field messages.
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-2xl">
      <div className="absolute left-[-9999px] h-0 overflow-hidden" aria-hidden="true">
        <label>
          {orderForm.honeypotLabel}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {error && (
        <div
          ref={summaryRef}
          role="alert"
          tabIndex={-1}
          className="p-4 bg-danger-soft border border-danger-edge rounded-lg text-danger-text focus-visible:outline-2 focus-visible:outline-brand"
        >
          {error}
        </div>
      )}

      <p className="text-base text-copy">{orderForm.requiredNote}</p>

      {/* Section: Dein Kunstwerk */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold">{orderForm.artworkHeading}</h2>
        <Field
          id="format"
          label={orderForm.productLabel}
          error={fieldErrors[formatErrorKey]}
          errorId={formatErrorKey}
        >
          <select
            id="format"
            name="format"
            value={formatValue}
            onChange={handleFormatChange}
            {...invalidProps(formatErrorKey, fieldErrors[formatErrorKey])}
            className={fieldClass}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {selectedPrice && (
            <p className="mt-2 text-base text-copy" aria-live="polite" data-testid="selected-price">
              {orderForm.priceLabel.replace('{price}', selectedPrice)}
            </p>
          )}
        </Field>

        <div>
          <UploadArea
            id="ultrasoundImage"
            labelText={orderForm.ultrasoundLabel}
            file={files.ultrasound}
            locale={locale}
            copy={uploadCopy}
            required
            hint={orderForm.uploadTip}
            inputProps={invalidProps('ultrasound', fieldErrors.ultrasound)}
            errorNode={<FieldError id="ultrasound" error={fieldErrors.ultrasound} />}
            onChange={(e) => handleFileChange(e, 'ultrasound')}
            onRemove={() => handleRemoveFile('ultrasound')}
          />
        </div>

        <TextField {...text('childName')} label={orderForm.childNameLabel} />
        <TextField
          {...text('weeksInWomb')}
          label={orderForm.weeksLabel}
          type="number"
          min={1}
          max={42}
          inputMode="numeric"
        />

        <Field
          id="specialRequests"
          label={orderForm.specialRequests}
          error={fieldErrors.specialRequests}
        >
          <textarea
            id="specialRequests"
            {...invalidProps('specialRequests', fieldErrors.specialRequests)}
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            rows={4}
            className={fieldClass}
          />
        </Field>
      </div>

      {/* Section: Deine Kontaktdaten */}
      <div className="space-y-6 border-t pt-6">
        <h2 className="text-lg font-bold">{orderForm.contactHeading}</h2>
        <TextField {...text('name')} label={orderForm.nameLabel} autoComplete="name" required />
        <TextField
          {...text('email')}
          label={orderForm.emailLabel}
          type="email"
          autoComplete="email"
          required
        />
      </div>

      {/* Shipping Address (Canvas Only) */}
      {formData.product === 'canvas' && (
        <div className="border-t pt-6">
          <h2 className="text-lg font-bold mb-4">{orderForm.shippingHeading}</h2>

          <TextField
            {...text('shippingStreet')}
            label={orderForm.shippingStreet}
            autoComplete="street-address"
            required
          />

          <div className="mt-4 grid grid-cols-[1fr_2fr] gap-4">
            <TextField
              {...text('shippingPostalCode')}
              label={orderForm.shippingPostalCode}
              inputMode="numeric"
              maxLength={5}
              autoComplete="postal-code"
              required
            />
            <TextField
              {...text('shippingCity')}
              label={orderForm.shippingCity}
              autoComplete="address-level2"
              required
            />
          </div>

          <Field
            id="shippingCountry"
            label={orderForm.shippingCountry}
            error={fieldErrors.shippingCountry}
            className="mt-4"
          >
            <select
              id="shippingCountry"
              {...invalidProps('shippingCountry', fieldErrors.shippingCountry)}
              name="shippingCountry"
              autoComplete="country-name"
              value={formData.shippingCountry}
              onChange={handleChange}
              className={fieldClass}
            >
              {shippingCountries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.labels[locale]}
                </option>
              ))}
            </select>
          </Field>

          <CheckboxField
            id="deliverToOther"
            checked={formData.deliverToOther}
            onChange={(checked) => setFormData((prev) => ({ ...prev, deliverToOther: checked }))}
            className="mt-6"
            labelClassName="min-h-11 py-2"
          >
            {orderForm.deliverToOtherLabel}
          </CheckboxField>

          {formData.deliverToOther && (
            <TextField
              {...text('shippingRecipient')}
              label={orderForm.shippingRecipientLabel}
              autoComplete="shipping name"
              required
              className="mt-4"
            />
          )}
        </div>
      )}

      {/* Consent: unticked by default. The two required boxes must be ticked before the photo is sent. */}
      <div className="space-y-4 border-t pt-6">
        <CheckboxField
          id="consentProcessing"
          checked={consent.processing}
          onChange={(checked) => setConsent((prev) => ({ ...prev, processing: checked }))}
          error={fieldErrors.consentProcessing}
        >
          {orderForm.consentProcessing.split('{link}')[0]}
          <Link
            href={privacyHref}
            className="py-3 font-semibold text-brand-strong underline underline-offset-4"
          >
            {copy.legal.datenschutz.title}
          </Link>
          {orderForm.consentProcessing.split('{link}')[1]}
        </CheckboxField>
        <CheckboxField
          id="consentRights"
          checked={consent.rights}
          onChange={(checked) => setConsent((prev) => ({ ...prev, rights: checked }))}
          error={fieldErrors.consentRights}
        >
          {orderForm.consentRights}
        </CheckboxField>
        <CheckboxField
          id="consentShowcase"
          checked={consent.showcase}
          onChange={(checked) => setConsent((prev) => ({ ...prev, showcase: checked }))}
        >
          {orderForm.consentShowcase}
        </CheckboxField>
        <p className="text-base text-body">{orderForm.withdrawalNote}</p>
      </div>

      <button
        type="submit"
        data-variant="primary"
        disabled={loading}
        className={buttonClasses('primary', 'w-full disabled:opacity-50')}
      >
        {loading ? orderForm.submitting : orderForm.submit}
      </button>

      {/* TODO(client): confirm the trust text and the legal wording of the consents before launch. */}
      <div className="space-y-3 text-center">
        <p className="text-base text-body">{orderForm.trustNote}</p>
      </div>
    </form>
  );
}
