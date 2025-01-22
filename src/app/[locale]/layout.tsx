import {NextIntlClientProvider, useMessages} from 'next-intl';
import {notFound} from 'next/navigation';
import type { Metadata } from "next";
 
export function generateStaticParams() {
  return [{locale: 'en'}, {locale: 'fr'}, {locale: 'es'}, {locale: 'it'}, {locale: 'pt'}, {locale: 'de'}];
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return {
    title: messages.Index.title,
    description: messages.Index.description,
  };
}
 
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
 
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
    </NextIntlClientProvider>
  );
}