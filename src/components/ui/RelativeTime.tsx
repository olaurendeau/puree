'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useEffect, useState } from 'react';

type RelativeTimeProps = {
  date: Date;
  locale: string;
  className?: string;
};

export const RelativeTime = ({ date, locale, className }: RelativeTimeProps) => {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const dateLocale = locale.startsWith('fr') ? fr : enUS;

  useEffect(() => {
    setFormattedDate(
      formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: dateLocale 
      })
    );
  }, [date, dateLocale]);

  return (
    <time 
      dateTime={date.toISOString()}
      className={className}
    >
      {formattedDate}
    </time>
  );
}; 