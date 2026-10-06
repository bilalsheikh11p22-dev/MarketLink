import { useState } from 'react'

import Navbar from '../components/Navbar.jsx'
import CinematicBackground from '../components/CinematicBackground.jsx'
import Footer from '../components/Footer.jsx'

import HeroSection from '../sections/HeroSection.jsx'
import StorySection from '../sections/StorySection.jsx'
import ExploreSection from '../sections/ExploreSection.jsx'
import FeaturedMarketSection from '../sections/FeaturedMarketSection.jsx'
import FarmerStorySection from '../sections/FarmerStorySection.jsx'
import FreshTodaySection from '../sections/FreshTodaySection.jsx'
import CinematicProductSection from '../sections/CinematicProductSection.jsx'
import FarmerShowcase from '../sections/FarmerShowcase.jsx'
import ProductStoryGrid from '../sections/ProductStoryGrid.jsx'
import CTASection from '../sections/CTASection.jsx'

export default function Home() {
  const [activeTab, setActiveTab] = useState('Markets')

  const goToDiscover = (tab) => {
    setActiveTab(tab)

    document
      .getElementById('discover')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
  }

  return (
    <>
      <Navbar />

      {/* =====================================================
          HERO + LANDING STORY
          ===================================================== */}
      <div className="relative">
        <CinematicBackground />

        <HeroSection />

        <StorySection />
      </div>

      {/* =====================================================
          DISCOVERY
          ===================================================== */}
      <ExploreSection
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <FeaturedMarketSection />

      <FarmerStorySection
        onMeetFarmers={() => goToDiscover('Farmers')}
      />

      <FreshTodaySection />

      {/* =====================================================
          CINEMATIC PRODUCT STORY
          ===================================================== */}
      <CinematicProductSection
        onExploreProducts={() => goToDiscover('Products')}
      />

      {/* =====================================================
          FARMERS + PRODUCTS
          ===================================================== */}
      <FarmerShowcase />

      <ProductStoryGrid />

      {/* =====================================================
          FINAL CTA
          ===================================================== */}
      <CTASection
        onExploreMarkets={() => goToDiscover('Markets')}
        onBrowseProducts={() => goToDiscover('Products')}
      />

      {/* =====================================================
          FOOTER
          ===================================================== */}
      <Footer />
    </>
  )
}