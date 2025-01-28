"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Language = {
  code: string;
  name: string;
};

const languages: Language[] = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "nl", name: "Nederlands" },
  { code: "ro", name: "Română" },
  { code: "et", name: "Eesti" },
];

export const LanguageSelector = ({ currentLocale }: { currentLocale: string }) => {
  const t = useTranslations("Navigation");
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="relative group">
      <div className="absolute bottom-full right-0 mb-2 py-2 w-32 bg-zinc-900 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="block w-full px-4 py-2 text-sm text-left text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            aria-label={`${t("switchTo")} ${language.name}`}
          >
            {language.name}
          </button>
        ))}
      </div>
      <button
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        aria-label={t("changeLanguage")}
      >
        <span>{languages.find((lang) => lang.code === currentLocale)?.name}</span>
        <svg
          className="w-4 h-4 rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
}; 