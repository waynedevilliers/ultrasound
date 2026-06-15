import Image from 'next/image';

export default function Hero() {

  return (
    <section className="bg-gradient-to-b from-slate-100 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1
              className="text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              ULTRASOUND ART
            </h1>

            <p className="text-lg text-gray-600 mb-8 whitespace-pre-line leading-relaxed">
              A tiny black-and-white ultrasound photo is a thing of the past. Let the very first image of your child live forever! I artistically enhance your ultrasound image and bring it to life with colour.
              {'\n'}
              Printed on canvas, you'll have not just a beautiful memory, but a modern, striking piece of décor for your home.
              {'\n'}
              Optionally personalised with your child's name and number of weeks in the womb.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/order"
                className="inline-block bg-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-600 transition text-center"
              >
                Order Now
              </a>
              <a
                href="#pricing"
                className="inline-block border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition text-center"
              >
                View Formats
              </a>
            </div>
          </div>

          <div className="relative h-96 lg:h-96">
            <Image
              src="/images/ultrasound.avif"
              alt="Ultrasound artwork example"
              fill
              className="object-cover rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
