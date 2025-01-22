
import { defaultLocale, locales } from '@/i18n/request'
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  localePrefix: 'always'
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}