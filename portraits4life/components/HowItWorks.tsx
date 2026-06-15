export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Send Your Image',
      description: 'Upload a clear ultrasound photo or personal portrait. We review it within 24 hours.',
    },
    {
      number: 2,
      title: 'Artistic Enhancement',
      description: 'Our artist creates a beautiful enhanced version with color and artistic touches.',
    },
    {
      number: 3,
      title: 'Receive & Enjoy',
      description: 'Get your high-quality digital file or canvas print. Perfect keepsake for your home.',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-5xl font-bold text-center mb-20 text-gray-900"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Simple Process
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition">
              <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-full bg-pink-100">
                <span className="text-xl font-bold text-pink-600">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
