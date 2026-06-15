export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Upload Your Image',
      description: 'Share your clear ultrasound image with me',
    },
    {
      number: 2,
      title: 'Artistic Enhancement',
      description: 'I create a beautiful digital portrait for you',
    },
    {
      number: 3,
      title: 'Canvas or Digital',
      description: 'Receive your canvas print or digital file',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-5xl font-bold text-center mb-16 text-gray-900"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mb-6 text-6xl flex justify-center">
                {step.number === 1 && '📤'}
                {step.number === 2 && '✨'}
                {step.number === 3 && '🎨'}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600 text-lg">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
