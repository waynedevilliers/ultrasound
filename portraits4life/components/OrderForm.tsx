'use client';

import { useEffect, useRef, useState } from 'react';
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
import { CONSENT_VERSION } from '@/lib/consent';
import { IMAGE_FORMAT_LIST } from '@/lib/image-formats';

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

export default function OrderForm({
  initialFormat = null,
}: {
  initialFormat?: FormatChoice | null;
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
  useEffect(() => {
    if (error) summaryRef.current?.focus();
  }, [error]);
  const [orderId, setOrderId] = useState('');

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
    formats: orderForm.imageFormats.replace('{formats}', IMAGE_FORMAT_LIST[locale === 'de' ? 'de' : 'en']),
    remove: orderForm.removeImage,
  };

  // Photos go straight from the browser to private storage. The order then carries only their paths.
  const uploadPhoto = async (file: File, prefix: string): Promise<string> => {
    const stored = await upload(`orders/${prefix}`, file, {
      access: 'private',
      handleUploadUrl: '/api/orders/upload',
      contentType: file.type,
    });
    return stored.pathname;
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
        required.push('shippingFullName', 'shippingStreet', 'shippingCity', 'shippingState', 'shippingPostalCode', 'shippingCountry');
      }
      const values = formData as Record<string, string>;
      const missing: Record<string, string> = {};
      for (const key of required) {
        if (!values[key].trim()) missing[key] = orderForm.requiredField;
      }
      if (formData.email.trim() && !formData.email.includes('@')) missing.email = orderForm.fieldInvalid;
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

      const ultrasoundPath = await uploadPhoto(files.ultrasound, 'ultrasound');
      const referencePath = files.reference ? await uploadPhoto(files.reference, 'reference') : '';

      const payload = {
        name: formData.name,
        email: formData.email,
        product: formData.product,
        childName: formData.childName,
        weeksInWomb: formData.weeksInWomb,
        specialRequests: formData.specialRequests,
        consent: { processing: true, rights: true, showcase: consent.showcase, version: CONSENT_VERSION },
        website: honeypot,
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

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: {
        orderId?: string;
        message?: string;
        issues?: { field: string; message: string }[];
      } = await response.json();

      if (!response.ok) {
        const issues = Array.isArray(data.issues) ? data.issues : [];
        const errors = fieldErrorsFromIssues(issues, orderForm.fieldInvalid);
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          setError(orderForm.checkFields);
          return;
        }
        throw new Error(orderForm.genericError);
      }

      setOrderId(data.orderId ?? '');
      setSubmitted(true);
      setFormData(EMPTY_FORM);
      setFiles({ ultrasound: null, reference: null });
    } catch (err) {
      console.error('Order submit failed', err);
      setError(orderForm.genericError);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-success-soft rounded-lg border border-success-edge">
        <h3 className="text-2xl font-bold text-success-text mb-4">{orderForm.successTitle}</h3>
        <p className="text-success-strong mb-2">{orderForm.submitted}</p>
        <p className="text-success-strong mb-4">
          <strong>{orderForm.orderIdLabel}</strong> #{orderId}
        </p>
        <p className="text-success-strong mb-4">{orderForm.contactWithin24h}</p>
        <button
          onClick={() => setSubmitted(false)}
          className="bg-success text-white px-6 py-2 rounded-lg hover:bg-success-strong"
        >
          {orderForm.newOrder}
        </button>
      </div>
    );
  }

  return (
    // noValidate: the browser's own required-field bubbles would hide our field messages.
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-2xl">
      <div className="absolute -left-[9999px] h-0 overflow-hidden" aria-hidden="true">
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
              <Link href={privacyHref} className="font-semibold text-brand-strong underline underline-offset-4">
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
          <Link href={privacyHref} className="font-semibold text-brand-strong underline underline-offset-4">
            {copy.legal.datenschutz.title}
          </Link>{' '}
          {orderForm.privacyAfter}
        </p>
      </div>
    </form>
  );
}
