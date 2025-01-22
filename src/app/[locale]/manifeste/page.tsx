import { Header } from '@/components/ui/Header';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Footer } from '@/components/ui/Footer';

export default async function Manifeste({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations('Manifesto');

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white mb-14">
      <Header locale={locale} />
      <main className="px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8 text-zinc-200">
          <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-purple-400">{t('whyPuree')}</h2>
            <p>{t('whyPureeText')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-purple-400">{t('ourMission')}</h2>
            <p>{t('ourMissionIntro')}</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>{t('missionPoints.point1')}</li>
              <li>{t('missionPoints.point2')}</li>
              <li>{t('missionPoints.point3')}</li>
              <li>{t('missionPoints.point4')}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-purple-400">{t('howItWorks')}</h2>
            <p>{t('howItWorksText')}</p>
          </section>

          <div className="pt-8 flex flex-col gap-4">
            <Link
              href="https://github.com/olaurendeau/puree"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {t('github')}
            </Link>
            <Link 
              href="/"
              className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t('backToHome')}
            </Link>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
} 