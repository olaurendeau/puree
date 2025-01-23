import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { Chat } from '@/components/chat/Chat';

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  return (
    <div className="flex flex-col h-[100dvh] bg-[#0C0C0C] text-white">
      <Header locale={locale} />
      <main className="flex-1 flex flex-col min-h-0 pb-14" role="main">
        <Chat locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
