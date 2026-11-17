'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { formatOptions } from '@/lib/format-options';
import { isCanvasSizeId } from '@/content/products';
import { buttonClasses } from '@/components/ActionLink';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/order-schema';
import { usePathname } from 'next/navigation';
import type { FormatChoice } from '@/lib/format-param';
import { getCopy, localeOf } from '@/lib/copy';
import Link from 'next/link';
import { routeHref, routes } from '@/content/routes';
import { upload } from '@vercel/blob/client';
import { clearFieldError, fieldErrorsFromIssues } from '@/lib/form-errors';
import UploadArea from '@/components/UploadArea';
import OrderSuccess from '@/components/OrderSuccess';
import { CONSENT_VERSION } from '@/lib/consent';
import { IMAGE_FORMAT_LIST } from '@/lib/image-formats';
import { createRequestCode } from '@/lib/request-code';

// Empty values for every field except product and size, which may come from the URL.
const EMPTY_FORM = {
  name: '',
  email: '',
  product: 'digital',
  canvasSize: '30x30cm',
  childName: '',
  weeksInWomb: '',
  specialRequests: '',
  shippingFullName: '',
  shippingStreet: '',
  shippingCity: '',
  shippingState: '',
  shippingPostalCode: '',
  shippingCountry: '',
} as const;

// A failed step of the submit, so the message can say what went wrong.
// 'invalid' is a rejected order that names no field (such as a bot check); 'rate' is too many attempts.
class OrderStageError extends Error {
  constructor(
    public stage: 'upload' | 'network' | 'server' | 'invalid' | 'rate',
    public code?: string,
  ) {
    super(stage);
  }
}

type ServerReply = {
  reference?: string;
  confirmationSent?: boolean;
  message?: string;
  code?: string;
  issues?: { field: string; message: string }[];
};

// Reads the reply body. A body that cannot be read is a failure, never a success: on a successful
// response it means the confirmation is missing; on an error response (for example a gateway page)
// the error status is enough to report, so the reply is treated as empty.
async function readReply(response: Response, requestCode: string): Promise<ServerReply> {
  try {
    return (await response.json()) as ServerReply;
  } catch (error) {
    if (response.ok) {
      throw new OrderStageError(error instanceof TypeError ? 'network' : 'server', requestCode);
    }
    return {};
  }
}

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
  const [consent, setConsent] = useState({ processing: false, rights: false, showcase: false });
  // Screen readers announce the summary (role=alert); focus moves there after a failed submit.
  const summaryRef = useRef<HTMLDivElement>(null);
  // After sending, focus moves to the success message. The page scrolls to it once its layout has changed.
  const successRef = useRef<HTMLDivElement>(null);
  const successHeadingId = useId();
  useEffect(() => {
    if (error) summaryRef.current?.focus();
  }, [error]);
  const [reference, setReference] = useState('');
  // The address the confirmation was sent to; null when the mail service did not accept it.
  const [confirmationTo, setConfirmationTo] = useState<string | null>(null);
  // The product of the sent order, so the success steps describe what really happens next.
  const [submittedProduct, setSubmittedProduct] = useState<'digital' | 'canvas'>('digital');
  useEffect(() => {
    if (!submitted) return;
    onSentChange?.(`${orderForm.successTitle} ${orderForm.referenceLabel} ${reference}`);
    successRef.current?.focus({ preventScroll: true });
  }, [submitted, onSentChange, orderForm.successTitle, orderForm.referenceLabel, reference]);

  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    product: initialFormat?.product ?? 'digital',
    canvasSize: initialFormat?.product === 'canvas' ? initialFormat.canvasSize : '30x30cm',
  });

  const [files, setFiles] = useState({
    ultrasound: null as File | null,
    reference: null as File | null,
  });

  // Spread onto an input: marks it invalid and links it to its message.
  const invalid = (key: string) =>
    fieldErrors[key] ? { 'aria-invalid': true, 'aria-describedby': `${key}-error` } : {};
  const fieldError = (key: string) =>
    fieldErrors[key] ? (
      <p id={`${key}-error`} className="mt-1 text-base text-danger-text">
        {fieldErrors[key]}
      </p>
    ) : null;

  // The product list sets both the product and the canvas size.
  const formatValue = formData.product === 'canvas' ? formData.canvasSize : 'digital';
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'ultrasound' | 'reference',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError(orderForm.fileTooLarge);
      setFieldErrors((prev) => ({ ...prev, [type]: orderForm.fileTooLarge }));
      e.target.value = '';
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(orderForm.fileType);
      setFieldErrors((prev) => ({ ...prev, [type]: orderForm.fileType }));
      e.target.value = '';
      return;
    }
    setError('');
    setFieldErrors((prev) => clearFieldError(prev, type));
    setFiles((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  // Removes a chosen photo and its error.
  const handleRemoveFile = (type: 'ultrasound' | 'reference') => {
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
      const required: string[] = ['name', 'email'];
      if (formData.product === 'canvas') {
        required.push(
          'shippingFullName',
          'shippingStreet',
          'shippingCity',
          'shippingState',
          'shippingPostalCode',
          'shippingCountry',
        );
      }
      const values = formData as Record<string, string>;
      const missing: Record<string, string> = {};
      for (const key of required) {
        if (!values[key].trim()) missing[key] = orderForm.requiredField;
      }
      if (formData.email.trim() && !formData.email.includes('@'))
        missing.email = orderForm.fieldInvalid;
      if (!files.ultrasound) missing.ultrasound = orderForm.ultrasoundRequired;
      if (!consent.processing) missing.consentProcessing = orderForm.consentRequired;
      if (!consent.rights) missing.consentRights = orderForm.consentRequired;
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

      const payload = {
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
        website: honeypot,
        requestCode,
        locale,
        ultrasoundPath,
        referencePath,
        ...(formData.product === 'canvas'
          ? {
              canvasSize: formData.canvasSize,
              shippingFullName: formData.shippingFullName,
              shippingStreet: formData.shippingStreet,
              shippingCity: formData.shippingCity,
              shippingState: formData.shippingState,
              shippingPostalCode: formData.shippingPostalCode,
              shippingCountry: formData.shippingCountry,
            }
          : {}),
      };

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
      <div
        ref={successRef}
        role="region"
        aria-labelledby={successHeadingId}
        tabIndex={-1}
        className="mx-auto max-w-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <OrderSuccess
          headingId={successHeadingId}
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
            confirmationTo
              ? orderForm.confirmationSent.replace('{email}', confirmationTo)
              : undefined
          }
          backHome={orderForm.backHome}
          homeHref={`/${locale}`}
        />
      </div>
    );
  }

  return (
    // noValidate: the browser's own required-field bubbles would hide our field messages.
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-2xl">
      <div className="absolute left-[-9999px] h-0 overflow-hidden" aria-hidden="true">
        <label>
          Website
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

      <p className="text-sm text-copy">{orderForm.requiredNote}</p>

      {/* Basic Fields */}
      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="name">
          {orderForm.nameLabel}
        </label>
        <input
          id="name"
          {...invalid('name')}
          type="text"
          name="name"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        {fieldError('name')}
      </div>

      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="email">
          {orderForm.emailLabel}
        </label>
        <input
          id="email"
          {...invalid('email')}
          type="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        {fieldError('email')}
      </div>

      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="format">
          {orderForm.productLabel}
        </label>
        <select
          id="format"
          name="format"
          value={formatValue}
          onChange={handleFormatChange}
          {...invalid(formatErrorKey)}
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        >
          {formatOptions(locale).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldError(formatErrorKey)}
      </div>

      {/* Optional Fields */}
      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="childName">
          {orderForm.childNameLabel}
        </label>
        <input
          id="childName"
          {...invalid('childName')}
          type="text"
          name="childName"
          value={formData.childName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        {fieldError('childName')}
      </div>

      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="weeksInWomb">
          {orderForm.weeksLabel}
        </label>
        <input
          id="weeksInWomb"
          {...invalid('weeksInWomb')}
          type="number"
          min={1}
          max={42}
          inputMode="numeric"
          name="weeksInWomb"
          value={formData.weeksInWomb}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        {fieldError('weeksInWomb')}
      </div>

      {/* Shipping Address (Canvas Only) */}
      {formData.product === 'canvas' && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold mb-4">{orderForm.shippingHeading}</h3>

          <div>
            <label
              className="block text-base font-medium text-body mb-2"
              htmlFor="shippingFullName"
            >
              {orderForm.shippingFullName}
            </label>
            <input
              id="shippingFullName"
              {...invalid('shippingFullName')}
              type="text"
              name="shippingFullName"
              autoComplete="name"
              value={formData.shippingFullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
            />
            {fieldError('shippingFullName')}
          </div>

          <div className="mt-4">
            <label className="block text-base font-medium text-body mb-2" htmlFor="shippingStreet">
              {orderForm.shippingStreet}
            </label>
            <input
              id="shippingStreet"
              {...invalid('shippingStreet')}
              type="text"
              name="shippingStreet"
              autoComplete="street-address"
              value={formData.shippingStreet}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
            />
            {fieldError('shippingStreet')}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-base font-medium text-body mb-2" htmlFor="shippingCity">
                {orderForm.shippingCity}
              </label>
              <input
                id="shippingCity"
                {...invalid('shippingCity')}
                type="text"
                name="shippingCity"
                autoComplete="address-level2"
                value={formData.shippingCity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              />
              {fieldError('shippingCity')}
            </div>
            <div>
              <label className="block text-base font-medium text-body mb-2" htmlFor="shippingState">
                {orderForm.shippingState}
              </label>
              <input
                id="shippingState"
                {...invalid('shippingState')}
                type="text"
                name="shippingState"
                autoComplete="address-level1"
                value={formData.shippingState}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              />
              {fieldError('shippingState')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label
                className="block text-base font-medium text-body mb-2"
                htmlFor="shippingPostalCode"
              >
                {orderForm.shippingPostalCode}
              </label>
              <input
                id="shippingPostalCode"
                {...invalid('shippingPostalCode')}
                type="text"
                name="shippingPostalCode"
                autoComplete="postal-code"
                value={formData.shippingPostalCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              />
              {fieldError('shippingPostalCode')}
            </div>
            <div>
              <label
                className="block text-base font-medium text-body mb-2"
                htmlFor="shippingCountry"
              >
                {orderForm.shippingCountry}
              </label>
              <input
                id="shippingCountry"
                {...invalid('shippingCountry')}
                type="text"
                name="shippingCountry"
                autoComplete="country-name"
                value={formData.shippingCountry}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              />
              {fieldError('shippingCountry')}
            </div>
          </div>
        </div>
      )}

      {/* File Uploads */}
      <div className="border-t pt-6">
        <UploadArea
          id="ultrasoundImage"
          labelText={orderForm.ultrasoundLabel}
          file={files.ultrasound}
          locale={locale}
          copy={uploadCopy}
          required
          inputProps={invalid('ultrasound')}
          errorNode={fieldError('ultrasound')}
          onChange={(e) => handleFileChange(e, 'ultrasound')}
          onRemove={() => handleRemoveFile('ultrasound')}
        />
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="specialRequests">
          {orderForm.specialRequests}
        </label>
        <textarea
          id="specialRequests"
          {...invalid('specialRequests')}
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        {fieldError('specialRequests')}
      </div>

      {/* Consent: unticked by default. The two required boxes must be ticked before the photo is sent. */}
      <div className="space-y-4 border-t pt-6">
        <div>
          <label className="flex items-start gap-3 text-base text-body">
            <input
              id="consentProcessing"
              type="checkbox"
              checked={consent.processing}
              onChange={(e) => setConsent((prev) => ({ ...prev, processing: e.target.checked }))}
              {...invalid('consentProcessing')}
              className="mt-1 h-5 w-5 shrink-0 accent-brand"
            />
            <span>
              {orderForm.consentProcessing.split('{link}')[0]}
              <Link
                href={privacyHref}
                className="font-semibold text-brand-strong underline underline-offset-4"
              >
                {copy.legal.datenschutz.title}
              </Link>
              {orderForm.consentProcessing.split('{link}')[1]}
            </span>
          </label>
          {fieldError('consentProcessing')}
        </div>
        <div>
          <label className="flex items-start gap-3 text-base text-body">
            <input
              id="consentRights"
              type="checkbox"
              checked={consent.rights}
              onChange={(e) => setConsent((prev) => ({ ...prev, rights: e.target.checked }))}
              {...invalid('consentRights')}
              className="mt-1 h-5 w-5 shrink-0 accent-brand"
            />
            <span>{orderForm.consentRights}</span>
          </label>
          {fieldError('consentRights')}
        </div>
        <label className="flex items-start gap-3 text-base text-body">
          <input
            id="consentShowcase"
            type="checkbox"
            checked={consent.showcase}
            onChange={(e) => setConsent((prev) => ({ ...prev, showcase: e.target.checked }))}
            className="mt-1 h-5 w-5 shrink-0 accent-brand"
          />
          <span>{orderForm.consentShowcase}</span>
        </label>
        <p className="text-sm text-copy">{orderForm.withdrawalNote}</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        data-variant="primary"
        disabled={loading}
        className={buttonClasses('primary', 'w-full disabled:opacity-50')}
      >
        {loading ? orderForm.submitting : orderForm.submit}
      </button>

      {/* TODO(client): confirm the trust text and the legal wording of the privacy line before launch. */}
      <div className="space-y-3 text-center">
        <p className="text-base text-body">{orderForm.trustNote}</p>
        <p className="text-sm text-copy">
          {orderForm.privacyBefore}{' '}
          <Link
            href={privacyHref}
            className="font-semibold text-brand-strong underline underline-offset-4"
          >
            {copy.legal.datenschutz.title}
          </Link>{' '}
          {orderForm.privacyAfter}
        </p>
      </div>
    </form>
  );
}
