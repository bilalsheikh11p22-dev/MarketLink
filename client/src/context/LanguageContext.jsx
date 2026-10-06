import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

export const LanguageContext = createContext(null)

const translations = {
  en: {
    home: 'Home',
    markets: 'Markets',
    farmers: 'Farmers',
    products: 'Products',
    about: 'About',

    nearby: 'Nearby',
    insights: 'Insights',
    assistant: 'Assistant',

    login: 'Login',
    getStarted: 'Get Started',
    logout: 'Log out',

    search: 'Search',
    searchPlaceholder:
      'Search markets, farmers, products...',

    cart: 'Cart',

    heroTitle:
      'From Local Farms to Your Table',

    heroText:
      'Discover fresh products directly from local farmers.',

    exploreMarkets:
      'Explore Markets',

    exploreProducts:
      'Explore Products',

    featuredMarkets:
      'Featured Markets',

    freshToday:
      'Fresh Today',

    discover:
      'Discover',

    learnMore:
      'Learn More',

    viewAll:
      'View All',

    shopNow:
      'Shop Now',

    contact:
      'Contact',

    farmersTitle:
      'Meet Local Farmers',

    productsTitle:
      'Fresh Products',

    marketsTitle:
      'Local Markets'
  },

  ur: {
    home: 'ہوم',
    markets: 'مارکیٹس',
    farmers: 'کسان',
    products: 'مصنوعات',
    about: 'ہمارے بارے میں',

    nearby: 'قریبی',
    insights: 'معلومات',
    assistant: 'اسسٹنٹ',

    login: 'لاگ ان',
    getStarted: 'شروع کریں',
    logout: 'لاگ آؤٹ',

    search: 'تلاش',
    searchPlaceholder:
      'مارکیٹس، کسان یا مصنوعات تلاش کریں...',

    cart: 'کارٹ',

    heroTitle:
      'مقامی کھیتوں سے آپ کی میز تک',

    heroText:
      'مقامی کسانوں سے تازہ مصنوعات براہ راست دریافت کریں۔',

    exploreMarkets:
      'مارکیٹس دیکھیں',

    exploreProducts:
      'مصنوعات دیکھیں',

    featuredMarkets:
      'نمایاں مارکیٹس',

    freshToday:
      'آج کی تازہ مصنوعات',

    discover:
      'دریافت کریں',

    learnMore:
      'مزید جانیں',

    viewAll:
      'سب دیکھیں',

    shopNow:
      'ابھی خریدیں',

    contact:
      'رابطہ',

    farmersTitle:
      'مقامی کسانوں سے ملیں',

    productsTitle:
      'تازہ مصنوعات',

    marketsTitle:
      'مقامی مارکیٹس'
  },
  roman: {
    home: 'Home',
    markets: 'Markets',
    farmers: 'Kisan',
    products: 'Products',
    about: 'Hamare bare mein',

    nearby: 'Qareebi',
    insights: 'Maloomat',
    assistant: 'Assistant',

    login: 'Login',
    getStarted: 'Shuru karein',
    logout: 'Logout',

    search: 'Talash',
    searchPlaceholder: 'Markets, kisan, products talash karein...',

    cart: 'Tokri',

    heroTitle: 'Local khet se seedha aap ki mez tak',
    heroText: 'Muqami kisanon se taza products seedha dhoondein.',

    exploreMarkets: 'Markets dekhein',
    exploreProducts: 'Products dekhein',
    featuredMarkets: 'Numayan markets',
    freshToday: 'Aaj ka taza maal',
    discover: 'Dariyaft karein',
    learnMore: 'Mazeed jaanein',
    viewAll: 'Sab dekhein',
    shopNow: 'Abhi kharidein',
    contact: 'Rabta',
    farmersTitle: 'Muqami kisanon se milein',
    productsTitle: 'Taza products',
    marketsTitle: 'Muqami markets'
  }
}

const languages = [
  {
    code: 'en',
    label: 'English'
  },
  {
    code: 'ur',
    label: 'اردو'
  },
  {
    code: 'roman',
    label: 'Roman Urdu'
  }
]

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem('marketlink-language')
      return translations[stored] ? stored : 'en'
    } catch {
      return 'en'
    }
  })

  const setLang = (newLanguage) => {
    if (!translations[newLanguage]) {
      return
    }

    setLangState(newLanguage)

    try { localStorage.setItem('marketlink-language', newLanguage) } catch { /* storage unavailable */ }

    // Persist to the account when signed in (best effort; the UI never blocks on it).
    try {
      if (localStorage.getItem('marketlink_token')) {
        import('../services/api.js').then(({ api }) => api('/auth/profile', { method: 'PUT', body: { language: newLanguage } })).catch(() => {})
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    document.documentElement.lang = lang === 'roman' ? 'ur-Latn' : lang

    document.documentElement.dir =
      lang === 'ur'
        ? 'rtl'
        : 'ltr'
  }, [lang])

  const t = (key) => {
    return (
      translations[lang]?.[key] ||
      translations.en?.[key] ||
      key
    )
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        languages,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

/*
  Custom hook
  This fixes:
  "does not provide an export named 'useLanguage'"
*/
export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error(
      'useLanguage must be used inside LanguageProvider'
    )
  }

  return context
}