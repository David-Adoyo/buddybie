// English is the site language. Kiswahili and other regional languages are
// parked for the next expansion cycle (see /docs/PARKING_LOT.md).
export const locales = ["en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
};

/** Cookie that stores the member's chosen locale. */
export const LOCALE_COOKIE = "bab_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
