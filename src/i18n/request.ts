import {getRequestConfig} from 'next-intl/server';
 
// Can be imported from a shared config
export const locales = ['en', 'fr', 'es', 'it', 'pt', 'de', 'nl', 'ro', 'et'];
export const defaultLocale = 'en';
 
export default getRequestConfig(async (params) => {
    const { requestLocale } = await params;
    const locale = await requestLocale || defaultLocale;

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
        timezone: 'Europe/Paris'
    };
});