'use client';

import { useState } from 'react';
import { canvasSizes } from '@/content/products';
import { buttonClasses } from '@/components/ActionLink';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/order-schema';
import { usePathname } from 'next/navigation';
import type { FormatChoice } from '@/lib/format-param';
import { getCopy, localeOf } from '@/lib/copy';
import { formatPrice } from '@/lib/price';
import { upload } from '@vercel/blob/client';
import { clearFieldError, fieldErrorsFromIssues } from '@/lib/form-errors';

export default function OrderForm({ initialFormat = null }: { initialFormat?: FormatChoice | null }) {
  const pathname = usePathname();
  const locale = localeOf(pathname);
  const orderForm = getCopy(locale).orderForm;

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  // Errors for single fields, keyed by field name; cleared when the field changes.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    product: initialFormat?.product ?? 'digital',
    canvasSize: initialFormat?.product === 'canvas' ? initialFormat.canvasSize : '30x30cm',
    childName: '',
    weeksInWomb: '',
    specialRequests: '',
    // Shipping address fields (only for canvas)
    shippingFullName: '',
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingPostalCode: '',
    shippingCountry: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFieldErrors(prev => clearFieldError(prev, name));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'ultrasound' | 'reference') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError(orderForm.fileTooLarge);
      e.target.value = '';
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(orderForm.fileType);
      e.target.value = '';
      return;
    }
    setError('');
    setFieldErrors(prev => clearFieldError(prev, type));
    setFiles(prev => ({
      ...prev,
      [type]: file,
    }));
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
      if (!files.ultrasound) {
        setFieldErrors({ ultrasound: orderForm.ultrasoundRequired });
        setError(orderForm.checkFields);
        return;
      }

      // Honeypot: hidden from visitors, must stay empty.
      const honeypot = (e.currentTarget.elements.namedItem('website') as HTMLInputElement | null)?.value ?? '';

      const ultrasoundPath = await uploadPhoto(files.ultrasound, 'ultrasound');
      const referencePath = files.reference ? await uploadPhoto(files.reference, 'reference') : '';

      const payload = {
        name: formData.name,
        email: formData.email,
        product: formData.product,
        childName: formData.childName,
        weeksInWomb: formData.weeksInWomb,
        specialRequests: formData.specialRequests,
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

      const data = await response.json();

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

      setOrderId(data.orderId);
      setSubmitted(true);
      setFormData({
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
      });
      setFiles({ ultrasound: null, reference: null });
    } catch {
      setError(orderForm.genericError);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-success-soft rounded-lg border border-success-edge">
        <h3 className="text-2xl font-bold text-success-text mb-4">
          {orderForm.successTitle}
        </h3>
        <p className="text-success-strong mb-2">
          {orderForm.submitted}
        </p>
        <p className="text-success-strong mb-4">
          <strong>{orderForm.orderIdLabel}</strong> #{orderId}
        </p>
        <p className="text-success-strong mb-4">
          {orderForm.contactWithin24h}
        </p>
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="absolute -left-[9999px] h-0 overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {error && (
        <div className="p-4 bg-danger-soft border border-danger-edge rounded-lg text-danger-text">
          {error}
        </div>
      )}

      {/* Basic Fields */}
      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="name">
          {orderForm.nameLabel}
        </label>
        <input id="name"
          {...invalid('name')}
          type="text"
          name="name" autoComplete="name"
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
        <input id="email"
          {...invalid('email')}
          type="email"
          name="email" autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        {fieldError('email')}
      </div>

      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="product">
          {orderForm.productLabel}
        </label>
        <select id="product"
          {...invalid('product')}
          name="product"
          value={formData.product}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        >
          <option value="digital">{orderForm.productDigital}</option>
          <option value="canvas">{orderForm.productCanvas}</option>
        </select>
        {fieldError('product')}
      </div>

      {formData.product === 'canvas' && (
        <div>
          <label className="block text-base font-medium text-body mb-2" htmlFor="canvasSize">
            {orderForm.canvasSizeLabel}
          </label>
          <select id="canvasSize"
          {...invalid('canvasSize')}
            name="canvasSize"
            value={formData.canvasSize}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
          >
            {canvasSizes.map((size) => (
              <option key={size.id} value={size.id}>
                {size.widthCm} × {size.heightCm} cm - {formatPrice(size.price, locale)}
              </option>
            ))}
          </select>
        {fieldError('canvasSize')}
        </div>
      )}

      {/* Optional Fields */}
      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="childName">
          {orderForm.childNameLabel}
        </label>
        <input id="childName"
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
        <input id="weeksInWomb"
          {...invalid('weeksInWomb')}
          type="text"
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
          <h3 className="text-lg font-bold mb-4">
            {orderForm.shippingHeading}
          </h3>

          <div>
            <label className="block text-base font-medium text-body mb-2" htmlFor="shippingFullName">
              {orderForm.shippingFullName}
            </label>
            <input id="shippingFullName"
          {...invalid('shippingFullName')}
              type="text"
              name="shippingFullName" autoComplete="name"
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
            <input id="shippingStreet"
          {...invalid('shippingStreet')}
              type="text"
              name="shippingStreet" autoComplete="street-address"
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
              <input id="shippingCity"
          {...invalid('shippingCity')}
                type="text"
                name="shippingCity" autoComplete="address-level2"
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
              <input id="shippingState"
          {...invalid('shippingState')}
                type="text"
                name="shippingState" autoComplete="address-level1"
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
              <label className="block text-base font-medium text-body mb-2" htmlFor="shippingPostalCode">
                {orderForm.shippingPostalCode}
              </label>
              <input id="shippingPostalCode"
          {...invalid('shippingPostalCode')}
                type="text"
                name="shippingPostalCode" autoComplete="postal-code"
                value={formData.shippingPostalCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              />
        {fieldError('shippingPostalCode')}
            </div>
            <div>
              <label className="block text-base font-medium text-body mb-2" htmlFor="shippingCountry">
                {orderForm.shippingCountry}
              </label>
              <input id="shippingCountry"
          {...invalid('shippingCountry')}
                type="text"
                name="shippingCountry" autoComplete="country-name"
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
        <div>
          <label className="block text-base font-medium text-body mb-2" htmlFor="ultrasoundImage">
            {orderForm.ultrasoundLabel}
          </label>
          <input id="ultrasoundImage"
          {...invalid('ultrasound')}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'ultrasound')}
            required
            className="w-full"
          />
        {fieldError('ultrasound')}
          {files.ultrasound && <p className="text-base text-success mt-1">{files.ultrasound.name}</p>}
        </div>

        <div className="mt-4">
          <label className="block text-base font-medium text-body mb-2" htmlFor="referenceImage">
            {orderForm.referenceLabel}
          </label>
          <input id="referenceImage"
          {...invalid('reference')}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'reference')}
            className="w-full"
          />
        {fieldError('reference')}
          {files.reference && <p className="text-base text-success mt-1">{files.reference.name}</p>}
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="specialRequests">
          {orderForm.specialRequests}
        </label>
        <textarea id="specialRequests"
          {...invalid('specialRequests')}
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        {fieldError('specialRequests')}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        data-variant="primary"
        disabled={loading}
        className={buttonClasses('primary', 'w-full disabled:opacity-50')}
      >
        {loading ? (orderForm.submitting) : orderForm.submit}
      </button>
    </form>
  );
}
