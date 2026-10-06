import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Farmers from './pages/Farmers.jsx'
import FarmerDetails from './pages/FarmerDetails.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderConfirmation from './pages/OrderConfirmation.jsx'
import Orders from './pages/Orders.jsx'
import OrderDetails from './pages/OrderDetails.jsx'

import Markets from './pages/markets/Markets.jsx'
import MarketDetails from './pages/markets/MarketDetails.jsx'
import MarketMap from './pages/markets/MarketMap.jsx'
import NearbyMarkets from './pages/markets/NearbyMarkets.jsx'
import MarketFarmers from './pages/markets/MarketFarmers.jsx'
import MarketProducts from './pages/markets/MarketProducts.jsx'

import FarmerDashboardLayout from './layouts/FarmerDashboardLayout.jsx'
import FarmerDashboard from './pages/farmer/FarmerDashboard.jsx'
import FarmerProfile from './pages/farmer/FarmerProfile.jsx'
import FarmerFarm from './pages/farmer/FarmerFarm.jsx'
import FarmerProducts from './pages/farmer/FarmerProducts.jsx'
import AddProduct from './pages/farmer/AddProduct.jsx'
import EditProduct from './pages/farmer/EditProduct.jsx'
import FarmerInventory from './pages/farmer/FarmerInventory.jsx'
import FarmerOrders from './pages/farmer/FarmerOrders.jsx'
import FarmerOrderDetails from './pages/farmer/FarmerOrderDetails.jsx'
import FarmerPickupSlots from './pages/farmer/FarmerPickupSlots.jsx'
import FarmerSales from './pages/farmer/FarmerSales.jsx'
import FarmerReviews from './pages/farmer/FarmerReviews.jsx'

import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import RoleProtectedRoute from './components/auth/RoleProtectedRoute.jsx'

import Favorites from './pages/customer/Favorites.jsx'
import Reviews from './pages/customer/Reviews.jsx'
import Notifications from './pages/customer/Notifications.jsx'
import Profile from './pages/customer/Profile.jsx'

import CustomerInsights from './pages/insights/CustomerInsights.jsx'
import FarmerAnalytics from './pages/farmer/FarmerAnalytics.jsx'
import MarketAnalytics from './pages/markets/MarketAnalytics.jsx'
import AdminAnalytics from './pages/admin/Analytics.jsx'
import AIAssistant from './pages/ai/AIAssistant.jsx'
import NotFound from './pages/NotFound.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'


import { lazy, Suspense } from 'react'
import AdminLayout from './layouts/AdminLayout.jsx'
import GlobalLoader from './components/GlobalLoader.jsx'

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'))
const AdminUsers = lazy(() => import('./pages/admin/Users.jsx'))
const AdminUserDetails = lazy(() => import('./pages/admin/UserDetails.jsx'))
const AdminFarmers = lazy(() => import('./pages/admin/Farmers.jsx'))
const AdminFarmerApprovals = lazy(() => import('./pages/admin/FarmerApprovals.jsx'))
const AdminFarmerDetails = lazy(() => import('./pages/admin/FarmerDetails.jsx'))
const AdminMarkets = lazy(() => import('./pages/admin/Markets.jsx'))
const AdminMarketDetails = lazy(() => import('./pages/admin/MarketDetails.jsx'))
const AdminProducts = lazy(() => import('./pages/admin/Products.jsx'))
const AdminProductDetails = lazy(() => import('./pages/admin/ProductDetails.jsx'))
const AdminCategories = lazy(() => import('./pages/admin/Categories.jsx'))
const AdminOrders = lazy(() => import('./pages/admin/Orders.jsx'))
const AdminOrderDetails = lazy(() => import('./pages/admin/OrderDetails.jsx'))
const AdminReviews = lazy(() => import('./pages/admin/Reviews.jsx'))
const AdminModeration = lazy(() => import('./pages/admin/Moderation.jsx'))
const AdminNotifications = lazy(() => import('./pages/admin/Notifications.jsx'))
const AdminReports = lazy(() => import('./pages/admin/Reports.jsx'))
const AdminProfile = lazy(() => import('./pages/admin/Profile.jsx'))
const AdminSettings = lazy(() => import('./pages/admin/Settings.jsx'))
const AdminImpact = lazy(() => import('./pages/admin/Impact.jsx'))
const AdminAuditLogs = lazy(() => import('./pages/admin/AuditLogs.jsx'))
const FarmerPickupQueue = lazy(() => import('./pages/farmer/FarmerPickupQueue.jsx'))
const FarmerWaste = lazy(() => import('./pages/farmer/FarmerWaste.jsx'))
const FarmerAssistant = lazy(() => import('./pages/farmer/FarmerAssistant.jsx'))


export default function App() {
  return (
    <><GlobalLoader />
     <Routes>
      
      <Route path="/" element={<Home />} />

      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />

      <Route path="/farmers" element={<Farmers />} />
      <Route path="/farmers/:id" element={<FarmerDetails />} />

      {/* Step 6 — Market discovery */}
      <Route path="/markets" element={<Markets />} />
      <Route path="/markets/:id" element={<MarketDetails />} />
      <Route path="/markets/:id/map" element={<MarketMap />} />
      <Route path="/markets/:id/farmers" element={<MarketFarmers />} />
      <Route path="/markets/:id/products" element={<MarketProducts />} />
      <Route path="/nearby-markets" element={<NearbyMarkets />} />
      <Route path="/insights" element={<CustomerInsights />} />
      <Route path="/ai-assistant" element={<AIAssistant />} />
      <Route path="/markets/:id/analytics" element={<MarketAnalytics />} />

      {/* Customer flow — unchanged from Step 4 */}
      <Route path="/cart" element={<Cart />} />
      <Route element={<RoleProtectedRoute roles={['customer']} />}>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
      </Route>

      {/* Step 7 — Authentication (frontend-only mock) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Step 7 — Customer account pages (any logged-in role) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Farmer Portal — separate role, separate data, nested under one layout */}
      <Route
        path="/farmer"
        element={
          <RoleProtectedRoute roles={['farmer']}>
            <FarmerDashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<FarmerDashboard />} />
        <Route path="profile" element={<FarmerProfile />} />
        <Route path="farm" element={<FarmerFarm />} />
        <Route path="products" element={<FarmerProducts />} />
        <Route path="products/new" element={<AddProduct />} />
        <Route path="products/:id/edit" element={<EditProduct />} />
        <Route path="inventory" element={<FarmerInventory />} />
        <Route path="orders" element={<FarmerOrders />} />
        <Route path="orders/:id" element={<FarmerOrderDetails />} />
        <Route path="pickup-slots" element={<FarmerPickupSlots />} />
        <Route path="sales" element={<FarmerSales />} />
        <Route path="analytics" element={<FarmerAnalytics />} />
        <Route path="pickup-queue" element={<Suspense fallback={null}><FarmerPickupQueue /></Suspense>} />
        <Route path="waste" element={<Suspense fallback={null}><FarmerWaste /></Suspense>} />
        <Route path="assistant" element={<Suspense fallback={null}><FarmerAssistant /></Suspense>} />
        <Route path="reviews" element={<FarmerReviews />} />
      </Route>

      {/* Step 8 — Admin Portal (frontend-only) */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute roles={['admin']}>
            <AdminLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={<div className="p-8 text-forest/50">Loading…</div>}><AdminDashboard /></Suspense>} />
        <Route path="users" element={<Suspense fallback={null}><AdminUsers /></Suspense>} />
        <Route path="users/:id" element={<Suspense fallback={null}><AdminUserDetails /></Suspense>} />
        <Route path="farmers" element={<Suspense fallback={null}><AdminFarmers /></Suspense>} />
        <Route path="farmers/approvals" element={<Suspense fallback={null}><AdminFarmerApprovals /></Suspense>} />
        <Route path="farmers/:id" element={<Suspense fallback={null}><AdminFarmerDetails /></Suspense>} />
        <Route path="markets" element={<Suspense fallback={null}><AdminMarkets /></Suspense>} />
        <Route path="markets/:id" element={<Suspense fallback={null}><AdminMarketDetails /></Suspense>} />
        <Route path="products" element={<Suspense fallback={null}><AdminProducts /></Suspense>} />
        <Route path="products/:id" element={<Suspense fallback={null}><AdminProductDetails /></Suspense>} />
        <Route path="categories" element={<Suspense fallback={null}><AdminCategories /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={null}><AdminOrders /></Suspense>} />
        <Route path="orders/:id" element={<Suspense fallback={null}><AdminOrderDetails /></Suspense>} />
        <Route path="reviews" element={<Suspense fallback={null}><AdminReviews /></Suspense>} />
        <Route path="moderation" element={<Suspense fallback={null}><AdminModeration /></Suspense>} />
        <Route path="notifications" element={<Suspense fallback={null}><AdminNotifications /></Suspense>} />
        <Route path="reports" element={<Suspense fallback={null}><AdminReports /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={null}><AdminAnalytics /></Suspense>} />
        <Route path="impact" element={<Suspense fallback={null}><AdminImpact /></Suspense>} />
        <Route path="audit-logs" element={<Suspense fallback={null}><AdminAuditLogs /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={null}><AdminProfile /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={null}><AdminSettings /></Suspense>} />
      </Route>
      {/* Utility pages */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
    
  )
}
