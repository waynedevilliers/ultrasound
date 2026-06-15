'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function OrderForm() {
  const t = useTranslations('order.form');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    productType: 'digital',
    canvasSize: '30',
    childName: '',
    weeksInWomb: '',
    photo1: '',
    photo2: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      productType: 'digital',
      canvasSize: '30',
      childName: '',
      weeksInWomb: '',
      photo1: '',
      photo2: '',
      message: '',
    });
    setTimeout(() => setSubmitted(false), 5000);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-green-900 mb-3">
          Vielen Dank! / Thank you!
        </h3>
        <p className="text-green-700">
          Wir haben Ihre Bestellung erhalten und werden uns in Kürze bei Ihnen melden. / We've received your order and will be in touch soon!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            {t('name')}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {t('email')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-2">
            {t('productType')}
          </label>
          <select
            id="productType"
            name="productType"
            value={formData.productType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="digital">{t('productDigital')}</option>
            <option value="canvas">{t('productCanvas')}</option>
          </select>
        </div>

        {formData.productType === 'canvas' && (
          <div>
            <label htmlFor="canvasSize" className="block text-sm font-medium text-gray-700 mb-2">
              {t('canvasSize')}
            </label>
            <select
              id="canvasSize"
              name="canvasSize"
              value={formData.canvasSize}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="30">{t('size30')}</option>
              <option value="40">{t('size40')}</option>
              <option value="50">{t('size50')}</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-2">
            {t('childName')}
          </label>
          <input
            type="text"
            id="childName"
            name="childName"
            value={formData.childName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Emma"
          />
        </div>

        <div>
          <label htmlFor="weeksInWomb" className="block text-sm font-medium text-gray-700 mb-2">
            {t('weeksInWomb')}
          </label>
          <input
            type="number"
            id="weeksInWomb"
            name="weeksInWomb"
            value={formData.weeksInWomb}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="20"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="photo1" className="block text-sm font-medium text-gray-700 mb-2">
            {t('photo1')}
          </label>
          <input
            type="file"
            id="photo1"
            name="photo1"
            onChange={handleChange}
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="photo2" className="block text-sm font-medium text-gray-700 mb-2">
            {t('photo2')}
          </label>
          <input
            type="file"
            id="photo2"
            name="photo2"
            onChange={handleChange}
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          {t('message')}
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="Share any special requests or details..."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition"
      >
        {t('submit')}
      </button>
    </form>
  );
}
