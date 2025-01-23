import Link from "next/link";
import { useTranslations } from "next-intl";

export const Header = ({locale}: {locale: string}) => {
  const t = useTranslations("Navigation");
  
  return (
    <div className="h-14 border-b border-zinc-800 flex items-center px-4 justify-between">
      <Link href="/" className="text-xl font-semibold">puree.chat</Link>
      <div className="flex items-center gap-6">
        <Link 
          href={`/${locale}/starred`} 
          className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
            aria-hidden="true"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {t("starred")}
        </Link>
        <Link 
          href={`/${locale}/manifeste`} 
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          {t("manifesto")}
        </Link>
      </div>
    </div>
  );
}; 