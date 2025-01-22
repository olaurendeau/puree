import { LanguageSelector } from "./LanguageSelector";

export const Footer = ({ locale }: { locale: string }) => {
  const commitHash = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 5) || '';

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-14 border-t border-zinc-800 flex items-center px-4 justify-between bg-black">
      <span className="text-xs text-zinc-600 font-mono">{commitHash}</span>
      <LanguageSelector currentLocale={locale} />
    </footer>
  );
}; 