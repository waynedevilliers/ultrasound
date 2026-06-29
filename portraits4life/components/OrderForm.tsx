'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

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
    if (file && file.size <= 15 * 1024 * 1024) {
      setFiles(prev => ({
        ...prev,
        [type]: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitFormData = new FormData();

      // Basic fields
      submitFormData.append('name', formData.name);
      submitFormData.append('email', formData.email);
      submitFormData.append('product', formData.product);

      if (formData.product === 'canvas') {
        submitFormData.append('canvasSize', formData.canvasSize);
        submitFormData.append('shippingFullName', formData.shippingFullName);
        submitFormData.append('shippingStreet', formData.shippingStreet);
        submitFormData.append('shippingCity', formData.shippingCity);
        submitFormData.append('shippingState', formData.shippingState);
        submitFormData.append('shippingPostalCode', formData.shippingPostalCode);
        submitFormData.append('shippingCountry', formData.shippingCountry);
      }

      submitFormData.append('childName', formData.childName);
      submitFormData.append('weeksInWomb', formData.weeksInWomb);
      submitFormData.append('specialRequests', formData.specialRequests);

      // Files
      if (files.ultrasound) {
        submitFormData.append('ultrasoundImage', files.ultrasound);
      }
      if (files.reference) {
        submitFormData.append('referenceImage', files.reference);
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: submitFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit order');
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
      <div className="max-w-2xl mx-auto p-8 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-2xl font-bold text-green-800 mb-4">
          {isDE ? 'Danke für deine Bestellung!' : 'Thank You for Your Order!'}
        </h3>
        <p className="text-green-700 mb-2">
          {isDE
            ? 'Deine Bestellung wurde erfolgreich eingereicht.'
            : 'Your order has been submitted successfully.'}
        </p>
        <p className="text-green-700 mb-4">
          <strong>{isDE ? 'Bestellnummer:' : 'Order ID:'}</strong> #{orderId}
        </p>
        <p className="text-green-700 mb-4">
          {isDE
            ? 'Wir werden dich innerhalb von 24 Stunden kontaktieren, um deine Bilder zu bestätigen.'
            : 'We will contact you within 24 hours to confirm your images.'}
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          {isDE ? 'Neue Bestellung' : 'New Order'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Basic Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isDE ? 'Dein Name *' : 'Your Name *'}
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isDE ? 'Deine E-Mail *' : 'Your Email *'}
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isDE ? 'Produkt *' : 'Product *'}
        </label>
        <select
          name="product"
          value={formData.product}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="digital">{isDE ? 'Digitales JPEG' : 'Digital JPEG'}</option>
          <option value="canvas">{isDE ? 'Leinwanddruck' : 'Canvas Print'}</option>
        </select>
      </div>

      {formData.product === 'canvas' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isDE ? 'Größe *' : 'Size *'}
          </label>
          <select
            name="canvasSize"
            value={formData.canvasSize}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="30x30cm">30 × 30 cm - €69</option>
            <option value="40x40cm">40 × 40 cm - €89</option>
            <option value="50x50cm">50 × 50 cm - €119</option>
          </select>
        </div>
      )}

      {/* Optional Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isDE ? "Babys Name" : "Child's Name"}
        </label>
        <input
          type="text"
          name="childName"
          value={formData.childName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isDE ? 'Wochen im Mutterleib' : 'Weeks in Womb'}
        </label>
        <input
          type="text"
          name="weeksInWomb"
          value={formData.weeksInWomb}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Shipping Address (Canvas Only) */}
      {formData.product === 'canvas' && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold mb-4">
            {isDE ? 'Lieferadresse *' : 'Shipping Address *'}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isDE ? 'Vollständiger Name *' : 'Full Name *'}
            </label>
            <input
              type="text"
              name="shippingFullName"
              value={formData.shippingFullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isDE ? 'Straße *' : 'Street *'}
            </label>
            <input
              type="text"
              name="shippingStreet"
              value={formData.shippingStreet}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isDE ? 'Stadt *' : 'City *'}
              </label>
              <input
                type="text"
                name="shippingCity"
                value={formData.shippingCity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isDE ? 'Bundesland *' : 'State *'}
              </label>
              <input
                type="text"
                name="shippingState"
                value={formData.shippingState}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isDE ? 'Postleitzahl *' : 'Postal Code *'}
              </label>
              <input
                type="text"
                name="shippingPostalCode"
                value={formData.shippingPostalCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isDE ? 'Land *' : 'Country *'}
              </label>
              <input
                type="text"
                name="shippingCountry"
                value={formData.shippingCountry}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* File Uploads */}
      <div className="border-t pt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isDE ? 'Ultraschallbild hochladen *' : 'Upload Ultrasound Image *'}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'ultrasound')}
            required
            className="w-full"
          />
          {files.ultrasound && <p className="text-sm text-green-600 mt-1">{files.ultrasound.name}</p>}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isDE ? 'Referenzbild hochladen' : 'Upload Reference Image'}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'reference')}
            className="w-full"
          />
          {files.reference && <p className="text-sm text-green-600 mt-1">{files.reference.name}</p>}
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isDE ? 'Besondere Wünsche' : 'Special Requests'}
        </label>
        <textarea
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50"
      >
        {loading ? (isDE ? 'Wird eingereicht...' : 'Submitting...') : isDE ? 'Jetzt Bestellen' : 'Submit Order'}
      </button>
    </form>
  );
}
