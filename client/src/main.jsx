import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { OrderProvider } from './context/OrderContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { FarmerProvider } from './context/FarmerContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { ReviewsProvider } from './context/ReviewsContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import OfflineStatus from './components/common/OfflineStatus.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Auto-respects prefers-reduced-motion across every Framer Motion
          animation in the app (hero, scroll scenes, cards, cinematic story). */}
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <LanguageProvider>
          <AuthProvider>
            <FavoritesProvider>
              <NotificationProvider>
                <CartProvider>
                  <OrderProvider>
                    <ReviewsProvider>
                      <FarmerProvider>
                        <ErrorBoundary><App /></ErrorBoundary>
                        <OfflineStatus />
                      </FarmerProvider>
                    </ReviewsProvider>
                  </OrderProvider>
                </CartProvider>
              </NotificationProvider>
            </FavoritesProvider>
          </AuthProvider>
          </LanguageProvider>
        </ToastProvider>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
