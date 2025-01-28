'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, es, it, de, pt, nl, ro, et } from 'date-fns/locale';
import { useEffect, useState } from 'react';

type RelativeTimeProps = {
  date: Date;
  locale: string;
  className?: string;
};

export const RelativeTime = ({ date, locale, className }: RelativeTimeProps) => {
  const [formattedDate, setFormattedDate] = useState<string>('');
  
  const getLocale = (locale: string) => {
    switch (locale.split('-')[0]) {
      case 'fr': return fr;
      case 'es': return es;
      case 'it': return it;
      case 'de': return de;
      case 'pt': return pt;
      case 'nl': return nl;
      case 'ro': return ro;
      case 'et': return et;
      case 'en': return enUS;
      default: return enUS; // On utilise l'anglais par défaut puisque c'est la langue par défaut de l'application
    }
  };

  useEffect(() => {
    setFormattedDate(
      formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: getLocale(locale)
      })
    );
  }, [date, locale]);

  return (
    <time 
      dateTime={date.toISOString()}
      className={className}
    >
      {formattedDate}
    </time>
  );
}; 