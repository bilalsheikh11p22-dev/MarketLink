
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import NotificationBell from './notifications/NotificationBell.jsx'
import UserMenu, { getUserLinks } from './auth/UserMenu.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const HOME_LINKS = [
  { key: 'home', href: '#home' },
  { key: 'markets', to: '/markets' },
  { key: 'farmers', href: '#discover' },
  { key: 'products', href: '#discover' },
  { key: 'about', to: '/about' }
]

const PAGE_LINKS = [
  { key: 'home', to: '/' },
  { key: 'markets', to: '/markets' },
  { key: 'products', to: '/products' },
  { key: 'nearby', to: '/nearby-markets' },
  { key: 'insights', to: '/insights' },
  { key: 'assistant', to: '/ai-assistant' }
]

function NavLinkItem({
  link,
  className = '',
  onClick,
  children,
  active = false
}) {
  const activeClasses = active
    ? 'text-olive-light -translate-y-1'
    : 'text-cream/85'

  if (link.to) {
    return (
      <Link
        to={link.to}
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        className={`relative inline-block ${className} ${activeClasses} transition-all duration-300 ease-out`}
      >
        {children}
        <span
          className={`absolute left-0 right-0 -bottom-2 h-[2px] bg-olive-light origin-center transition-all duration-300 ease-out ${
            active
              ? 'scale-x-100 opacity-100'
              : 'scale-x-0 opacity-0'
          }`}
        />
        {active && <span className="sr-only">(current page)</span>}
      </Link>
    )
  }

  return (
    <a
      href={link.href}
      onClick={onClick}
      className={`relative inline-block ${className} ${activeClasses} transition-all duration-300 ease-out`}
    >
      {children}
      <span className="absolute left-0 right-0 -bottom-2 h-[2px] bg-olive-light origin-center scale-x-0 opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-100" />
    </a>
  )
}

function LanguageSelect() {
  const { lang, setLang, languages } = useLanguage()

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Select language</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label="Select language"
        className="appearance-none bg-transparent border border-cream/25 rounded-lg pl-3 pr-8 py-2 text-sm text-cream cursor-pointer transition-all duration-300 hover:border-olive-light/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
      >
        {languages.map((language) => (
          <option
            key={language.code}
            value={language.code}
            className="text-forest-deep bg-cream"
          >
            {language.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cream/60 text-xs">
        ▾
      </span>
    </label>
  )
}

function CartIcon({ cartCount }) {
  const controls = useAnimation()
  const previousCount = useRef(cartCount)

  useEffect(() => {
    if (cartCount > previousCount.current) {
      controls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.4, ease: 'easeOut' }
      })
    }

    previousCount.current = cartCount
  }, [cartCount, controls])

  return (
    <Link
      to="/cart"
      aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
      className="relative text-cream/85 hover:text-cream transition-colors duration-200"
    >
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h8.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>

      <AnimatePresence>
        {cartCount > 0 && (
          <motion.span
            animate={controls}
            initial={{ opacity: 0, scale: 0.6 }}
            className="absolute -top-2 -right-2.5 flex items-center justify-center h-4 w-4 rounded-full bg-olive text-forest-deep text-[10px] font-medium"
          >
            {cartCount > 9 ? '9+' : cartCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}

function MobileAccountLinks({ onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = getUserLinks(user?.role)

  const handleLogout = () => {
    logout()
    onNavigate()
    navigate('/')
  }

  return (
    <div className="flex flex-col gap-1">
      {links.map(({ to, href, label }) => (
        <Link
          key={label}
          to={to || href || '/'}
          onClick={onNavigate}
          className="py-2 text-cream/85 text-sm hover:text-cream"
        >
          {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={handleLogout}
        className="py-2 text-left text-olive-light text-sm"
      >
        Log out
      </button>
    </div>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { cartCount } = useCart()
  const { pathname } = useLocation()
  const { isAuthenticated } = useAuth()
  const { t: tr } = useLanguage()
  const navigate = useNavigate()

  const LINKS = pathname === '/' ? HOME_LINKS : PAGE_LINKS

  const isActive = (link) => {
    if (!link.to) return false
    if (link.to === '/') return pathname === '/'
    return pathname === link.to || pathname.startsWith(`${link.to}/`)
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])

  const handleSearch = (event) => {
    event.preventDefault()
    const query = searchQuery.trim()

    if (!query) return

    setSearchOpen(false)
    setMenuOpen(false)
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleNavigation = () => setMenuOpen(false)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-forest-deep/95 backdrop-blur-md py-3 shadow-[0_1px_0_0_rgba(246,241,231,0.08)]'
          : 'bg-forest-deep/95 md:bg-transparent py-5 md:py-6'
      }`}
    >
      <nav className="container-page flex items-center justify-between">
        <Link
          to="/"
          onClick={handleNavigation}
          className="font-display text-2xl md:text-3xl text-cream tracking-wide transition-opacity duration-300 hover:opacity-80 shrink-0"
        >
          MarketLink
        </Link>

        <ul className="hidden md:flex items-center gap-8 lg:gap-10 font-body text-[0.95rem]">
          {LINKS.map((link) => (
            <li key={link.key}>
              <NavLinkItem
                link={link}
                active={isActive(link)}
                onClick={handleNavigation}
                className="py-2 px-1 group"
              >
                {tr(link.key)}
              </NavLinkItem>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-5 lg:gap-6">
          <AnimatePresence mode="wait">
            {!searchOpen ? (
              <motion.button
                key="search-button"
                type="button"
                aria-label={tr('search')}
                onClick={() => setSearchOpen(true)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-cream/85 hover:text-cream transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </motion.button>
            ) : (
              <motion.form
                key="search-form"
                onSubmit={handleSearch}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 250, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center overflow-hidden"
              >
                <div className="flex items-center w-full border-b border-olive-light/70 pb-1.5">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="text-cream/60 mr-2 shrink-0"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>

                  <input
                    autoFocus
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={tr('searchPlaceholder')}
                    className="w-full bg-transparent outline-none text-cream text-sm placeholder:text-cream/40"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSearchOpen(false)
                    }}
                    aria-label="Close search"
                    className="text-cream/50 hover:text-cream text-lg ml-2"
                  >
                    ×
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <LanguageSelect />
          <CartIcon cartCount={cartCount} />

          {isAuthenticated ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-cream/85 hover:text-cream text-sm transition-colors"
              >
                {tr('login')}
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 border border-olive-light/70 text-cream text-sm hover:bg-olive-light hover:text-forest-deep transition-colors duration-300"
              >
                {tr('getStarted')}
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-4">
          <LanguageSelect />
          {isAuthenticated && <NotificationBell />}
          <CartIcon cartCount={cartCount} />

          <button
            type="button"
            className="relative z-50 w-8 h-6 flex flex-col justify-between"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <motion.span
              animate={
                menuOpen
                  ? { rotate: 45, y: 10 }
                  : { rotate: 0, y: 0 }
              }
              className="h-px w-full bg-cream origin-center"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="h-px w-full bg-cream"
            />
            <motion.span
              animate={
                menuOpen
                  ? { rotate: -45, y: -10 }
                  : { rotate: 0, y: 0 }
              }
              className="h-px w-full bg-cream origin-center"
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-forest-deep/98 backdrop-blur-md"
          >
            <ul className="container-page flex flex-col gap-1 py-6">
              {LINKS.map((link) => (
                <li key={link.key}>
                  <NavLinkItem
                    link={link}
                    active={isActive(link)}
                    onClick={handleNavigation}
                    className="block w-full py-3 text-lg font-display border-b border-cream/10"
                  >
                    {tr(link.key)}
                  </NavLinkItem>
                </li>
              ))}

              <li className="pt-4">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center border-b border-cream/20 pb-2"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="text-cream/60 mr-2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={tr('searchPlaceholder')}
                    className="w-full bg-transparent outline-none text-cream text-sm placeholder:text-cream/40"
                  />
                </form>
              </li>

              {isAuthenticated ? (
                <li className="pt-5">
                  <MobileAccountLinks onNavigate={handleNavigation} />
                </li>
              ) : (
                <li className="flex gap-6 pt-5">
                  <Link
                    to="/login"
                    onClick={handleNavigation}
                    className="text-cream/85 text-sm"
                  >
                    {tr('login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleNavigation}
                    className="text-olive-light text-sm"
                  >
                    {tr('getStarted')}
                  </Link>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}