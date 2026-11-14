import type { Metadata } from 'next';
import Header from '@/components/Header';
import OrderForm from '@/components/OrderForm';
import OrderInfo from '@/components/OrderInfo';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import JsonLd from '@/components/JsonLd';
import { getCopy } from '@/lib/copy';
import { pageMetadata, seoCopy, SITE_URL } from '@/lib/metadata';
import { breadcrumbJsonLd, organizationJsonLd } from '@/lib/structured-data';
import { parseFormatParam } from '@/lib/format-param';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({ locale, path: '/order', ...seoCopy(locale, 'order') });
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ format?: string }>;
}) {
  const { locale } = await params;
  const { format } = await searchParams;
  const copy = getCopy(locale === 'de' ? 'de' : 'en');
  const home = { label: copy.common.home, href: `/${locale}` };
  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={organizationJsonLd(SITE_URL)} />
      {SITE_URL && (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: home.label, url: `${SITE_URL}${home.href}` },
            { name: copy.common.order, url: `${SITE_URL}/${locale}/order` },
          ])}
        />
      )}
      <Header />
      <main className="flex-1 section-y bg-canvas">
        <Breadcrumb label={copy.common.breadcrumb} items={[home, { label: copy.common.order }]} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <h1 className="font-display heading-xl font-bold mb-4 text-ink text-center">{copy.order.title}</h1>

          <p className="text-center text-copy mb-12 max-w-2xl mx-auto">{copy.orderPage.intro}</p>

          <div className="bg-surface rounded-lg shadow-lg p-8 mb-12">
            <OrderForm initialFormat={parseFormatParam(format)} />
          </div>

          <OrderInfo />
        </div>
      </main>
      <Footer />
    </div>
  );
}
