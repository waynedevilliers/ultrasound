import Header from '@/components/Header';
import OrderForm from '@/components/OrderForm';
import OrderInfo from '@/components/OrderInfo';
import Footer from '@/components/Footer';

export default function OrderPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-5xl font-bold mb-4 text-gray-900 text-center"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Bestellen / Order
          </h1>

          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Hier können Sie Ihr Ultraschallbild hochladen und Ihre Bestellung aufgeben. / Upload your ultrasound image and place your order here.
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <OrderForm />
          </div>

          <OrderInfo />
        </div>
      </main>
      <Footer />
    </div>
  );
}
