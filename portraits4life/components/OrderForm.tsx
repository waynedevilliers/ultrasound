'use client';

import { useState } from 'react';
import { canvasSizes } from '@/content/products';
import { buttonClasses } from '@/components/ActionLink';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/order-schema';
import { usePathname } from 'next/navigation';
import { upload } from '@vercel/blob/client';

export default function OrderForm() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    product: 'digital',
    canvasSize: '30x30cm',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'ultrasound' | 'reference') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError(isDE ? 'Die Datei ist größer als 15 MB. Bitte ein kleineres Bild wählen.' : 'The file is larger than 15 MB. Please choose a smaller image.');
      e.target.value = '';
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(isDE ? 'Nur JPG, PNG, WebP oder HEIC.' : 'Only JPG, PNG, WebP or HEIC.');
      e.target.value = '';
      return;
    }
    setError('');
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

    try {
      if (!files.ultrasound) {
        throw new Error(isDE ? 'Bitte lade ein Ultraschallbild hoch.' : 'Please upload an ultrasound image.');
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
        const details = Array.isArray(data.issues) ? data.issues.map((issue: { message: string }) => issue.message).join(' ') : '';
        throw new Error(details || data.message || data.error || 'Failed to submit order');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-success-soft rounded-lg border border-success-edge">
        <h3 className="text-2xl font-bold text-success-text mb-4">
          {isDE ? 'Danke für deine Bestellung!' : 'Thank You for Your Order!'}
        </h3>
        <p className="text-success-strong mb-2">
          {isDE
            ? 'Deine Bestellung wurde erfolgreich eingereicht.'
            : 'Your order has been submitted successfully.'}
        </p>
        <p className="text-success-strong mb-4">
          <strong>{isDE ? 'Bestellnummer:' : 'Order ID:'}</strong> #{orderId}
        </p>
        <p className="text-success-strong mb-4">
          {isDE
            ? 'Wir werden dich innerhalb von 24 Stunden kontaktieren, um deine Bilder zu bestätigen.'
            : 'We will contact you within 24 hours to confirm your images.'}
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="bg-success text-white px-6 py-2 rounded-lg hover:bg-success-strong"
        >
          {isDE ? 'Neue Bestellung' : 'New Order'}
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
          {isDE ? 'Dein Name *' : 'Your Name *'}
        </label>
        <input id="name"
          type="text"
          name="name" autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="email">
          {isDE ? 'Deine E-Mail *' : 'Your Email *'}
        </label>
        <input id="email"
          type="email"
          name="email" autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="product">
          {isDE ? 'Produkt *' : 'Product *'}
        </label>
        <select id="product"
          name="product"
          value={formData.product}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        >
          <option value="digital">{isDE ? 'Digitales JPEG' : 'Digital JPEG'}</option>
          <option value="canvas">{isDE ? 'Leinwanddruck' : 'Canvas Print'}</option>
        </select>
      </div>

      {formData.product === 'canvas' && (
        <div>
          <label className="block text-base font-medium text-body mb-2" htmlFor="canvasSize">
            {isDE ? 'Größe *' : 'Size *'}
          </label>
          <select id="canvasSize"
            name="canvasSize"
            value={formData.canvasSize}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
          >
            {canvasSizes.map((size) => (
              <option key={size.id} value={size.id}>
                {size.widthCm} × {size.heightCm} cm - €{size.price}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Optional Fields */}
      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="childName">
          {isDE ? "Babys Name" : "Child's Name"}
        </label>
        <input id="childName"
          type="text"
          name="childName"
          value={formData.childName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="weeksInWomb">
          {isDE ? 'Wochen im Mutterleib' : 'Weeks in Womb'}
        </label>
        <input id="weeksInWomb"
          type="text"
          name="weeksInWomb"
          value={formData.weeksInWomb}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        />
      </div>

      {/* Shipping Address (Canvas Only) */}
      {formData.product === 'canvas' && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold mb-4">
            {isDE ? 'Lieferadresse *' : 'Shipping Address *'}
          </h3>

          <div>
            <label className="block text-base font-medium text-body mb-2" htmlFor="shippingFullName">
              {isDE ? 'Vollständiger Name *' : 'Full Name *'}
            </label>
            <input id="shippingFullName"
              type="text"
              name="shippingFullName" autoComplete="name"
              value={formData.shippingFullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          <div className="mt-4">
            <label className="block text-base font-medium text-body mb-2" htmlFor="shippingStreet">
              {isDE ? 'Straße *' : 'Street *'}
            </label>
            <input id="shippingStreet"
              type="text"
              name="shippingStreet" autoComplete="street-address"
              value={formData.shippingStreet}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-base font-medium text-body mb-2" htmlFor="shippingCity">
                {isDE ? 'Stadt *' : 'City *'}
              </label>
              <input id="shippingCity"
                type="text"
                name="shippingCity" autoComplete="address-level2"
                value={formData.shippingCity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-body mb-2" htmlFor="shippingState">
                {isDE ? 'Bundesland *' : 'State *'}
              </label>
              <input id="shippingState"
                type="text"
                name="shippingState" autoComplete="address-level1"
                value={formData.shippingState}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-base font-medium text-body mb-2" htmlFor="shippingPostalCode">
                {isDE ? 'Postleitzahl *' : 'Postal Code *'}
              </label>
              <input id="shippingPostalCode"
                type="text"
                name="shippingPostalCode" autoComplete="postal-code"
                value={formData.shippingPostalCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-body mb-2" htmlFor="shippingCountry">
                {isDE ? 'Land *' : 'Country *'}
              </label>
              <input id="shippingCountry"
                type="text"
                name="shippingCountry" autoComplete="country-name"
                value={formData.shippingCountry}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* File Uploads */}
      <div className="border-t pt-6">
        <div>
          <label className="block text-base font-medium text-body mb-2" htmlFor="ultrasoundImage">
            {isDE ? 'Ultraschallbild hochladen *' : 'Upload Ultrasound Image *'}
          </label>
          <input id="ultrasoundImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'ultrasound')}
            required
            className="w-full"
          />
          {files.ultrasound && <p className="text-base text-success mt-1">{files.ultrasound.name}</p>}
        </div>

        <div className="mt-4">
          <label className="block text-base font-medium text-body mb-2" htmlFor="referenceImage">
            {isDE ? 'Referenzbild hochladen' : 'Upload Reference Image'}
          </label>
          <input id="referenceImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'reference')}
            className="w-full"
          />
          {files.reference && <p className="text-base text-success mt-1">{files.reference.name}</p>}
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-base font-medium text-body mb-2" htmlFor="specialRequests">
          {isDE ? 'Besondere Wünsche' : 'Special Requests'}
        </label>
        <textarea id="specialRequests"
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-field rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        data-variant="primary"
        disabled={loading}
        className={buttonClasses('primary', 'w-full disabled:opacity-50')}
      >
        {loading ? (isDE ? 'Wird eingereicht...' : 'Submitting...') : isDE ? 'Jetzt Bestellen' : 'Submit Order'}
      </button>
    </form>
  );
}
