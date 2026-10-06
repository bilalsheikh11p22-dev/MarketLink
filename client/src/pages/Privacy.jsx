import PageLayout from '../components/PageLayout.jsx'
const S = ({ t, children }) => <section className="mb-8"><h2 className="font-display text-xl text-forest-deep mb-2">{t}</h2><div className="space-y-2 text-forest-deep/75 text-sm leading-relaxed">{children}</div></section>
export default function Privacy() {
  return (
    <PageLayout eyebrow="Legal" title="Privacy Policy" subtitle="What MarketLink collects, why, and the choices you have.">
      <div className="max-w-3xl">
        <p className="mb-8 rounded-lg bg-olive/10 px-4 py-3 text-sm text-forest-deep">This is a project template describing how the software handles data. Have it reviewed by a qualified professional before running a public service.</p>
        <S t="Information we collect"><p>Account details (name, email, phone, city), your orders and pickup choices, favourites, reviews, notification preferences and, for farmers, farm and product information.</p><p>If you choose to share your location with the assistant or nearby-markets search, it is used to calculate distances in that request and is not stored on your profile.</p></S>
        <S t="How we use it"><p>To run the marketplace: process pre-orders, show pickup information, send notifications you have enabled, moderate reviews and keep the platform secure.</p></S>
        <S t="Payments"><p>MarketLink does not take online payments. You pay the farmer on pickup, so we do not collect card details.</p></S>
        <S t="Storage and security"><p>Passwords are hashed and never stored in plain text. A sign-in token is kept in your browser so you stay logged in. Private account data is not cached by the offline service worker.</p></S>
        <S t="Sharing"><p>Farmers see the name and pickup details of customers who order from them. Reviews show your name. We do not sell personal data.</p></S>
        <S t="Your choices"><p>You can update your profile and notification preferences at any time, and ask us to delete your account via the Contact page.</p></S>
      </div>
    </PageLayout>
  )
}
