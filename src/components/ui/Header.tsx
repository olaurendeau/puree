import Link from "next/link";
import { useTranslations } from "next-intl";

export const Header = ({locale}: {locale: string}) => {
  const t = useTranslations("Navigation");
  
  return (
    <div className="h-14 border-b border-zinc-800 flex items-center px-4 justify-between">
      <Link href="/" className="text-xl font-semibold">puree.chat</Link>
      <Link href={`/${locale}/manifeste`} className="text-purple-400 hover:text-purple-300 transition-colors">
        {t("manifesto")}
      </Link>
    </div>
  );
}; 