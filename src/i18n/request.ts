import {getRequestConfig} from 'next-intl/server';
 
// Can be imported from a shared config
export const locales = ['fr', 'en', 'es', 'it', 'pt', 'de'];
export const defaultLocale = 'fr';
 
export default getRequestConfig(async (params) => {
    const { requestLocale } = await params;
    const locale = await requestLocale || defaultLocale;

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
        timezone: 'Europe/Paris'
    };
});