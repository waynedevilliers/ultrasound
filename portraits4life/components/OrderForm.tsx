'use client';

import { useState } from 'react';

export default function OrderForm() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create form data for file upload
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('productType', formData.productType);
    formDataToSend.append('canvasSize', formData.canvasSize);
    formDataToSend.append('childName', formData.childName);
    formDataToSend.append('weeksInWomb', formData.weeksInWomb);
    formDataToSend.append('message', formData.message);

    // Log to console and show success (for now)
    console.log('Order submitted:', formData);

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
    setTimeout(() => setSubmitted(false), 6000);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-green-900 mb-3">
          Thank you!
        </h3>
        <p className="text-green-700 mb-4">
          We've received your order! We'll review your images and contact you within 24 hours.
        </p>
        <p className="text-sm text-green-600">
          Check your email for next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Your Name *
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
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="productType" className="block text-sm font-semibold text-gray-700 mb-2">
            What would you like? *
          </label>
          <select
            id="productType"
            name="productType"
            value={formData.productType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="digital">High-Res Digital JPG (€30-50, 1 week)</option>
            <option value="canvas">Canvas Print (1-2 weeks)</option>
          </select>
        </div>

        {formData.productType === 'canvas' && (
          <div>
            <label htmlFor="canvasSize" className="block text-sm font-semibold text-gray-700 mb-2">
              Canvas Size *
            </label>
            <select
              id="canvasSize"
              name="canvasSize"
              value={formData.canvasSize}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="30">30 × 30 cm (€69)</option>
              <option value="40">40 × 40 cm (€89)</option>
              <option value="50">50 × 50 cm (€119)</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="childName" className="block text-sm font-semibold text-gray-700 mb-2">
            Child's Name (Optional)
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
          <label htmlFor="weeksInWomb" className="block text-sm font-semibold text-gray-700 mb-2">
            Weeks in Womb (Optional)
          </label>
          <input
            type="number"
            id="weeksInWomb"
            name="weeksInWomb"
            min="0"
            max="42"
            value={formData.weeksInWomb}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="20"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="photo1" className="block text-sm font-semibold text-gray-700 mb-2">
            Upload Main Image (max 15 MB) *
          </label>
          <input
            type="file"
            id="photo1"
            name="photo1"
            onChange={handleChange}
            accept="image/*"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">JPG, PNG - Clear, high quality preferred</p>
        </div>

        <div>
          <label htmlFor="photo2" className="block text-sm font-semibold text-gray-700 mb-2">
            Additional Image (Optional)
          </label>
          <input
            type="file"
            id="photo2"
            name="photo2"
            onChange={handleChange}
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">For couple portraits or reference</p>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
          Special Requests or Questions (Optional)
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
          placeholder="Tell us anything special about your order..."
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Next Steps:</strong> After submission, we'll review your images within 24 hours and email you with confirmation and next steps for payment.
        </p>
      </div>

      <button
        type="submit"
        className="w-full bg-pink-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-pink-600 transition shadow-md"
      >
        Send Order Request
      </button>
    </form>
  );
}
