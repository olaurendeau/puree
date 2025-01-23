import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { getStarredConversations } from '@/app/actions/starred-conversations';
import { StarredConversationList } from '@/components/starred/StarredConversationList';
import { getTranslations } from 'next-intl/server';

export default async function StarredPage({params}: {params: Promise<{locale: string}>}) {
    const {locale} = await params;
  const t = await getTranslations('Starred');
  const language = locale.split('-')[0];
  const { conversations, hasMore } = await getStarredConversations(language, 0, 2);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0C0C0C] text-white">
      <Header locale={locale} />
      <main className="flex-1 overflow-auto p-4 pb-12" role="main">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-medium text-zinc-200 mb-8">{t('title')}</h1>
          <StarredConversationList 
            locale={locale}
            initialConversations={conversations}
            hasMoreInitial={hasMore}
          />
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
} 