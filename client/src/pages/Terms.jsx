import PageLayout from '../components/PageLayout.jsx'
const S = ({ t, children }) => <section className="mb-8"><h2 className="font-display text-xl text-forest-deep mb-2">{t}</h2><div className="space-y-2 text-forest-deep/75 text-sm leading-relaxed">{children}</div></section>
export default function Terms() {
  return (
    <PageLayout eyebrow="Legal" title="Terms of Service" subtitle="The ground rules for customers, farmers and administrators.">
      <div className="max-w-3xl">
        <p className="mb-8 rounded-lg bg-olive/10 px-4 py-3 text-sm text-forest-deep">This is a project template. Have it reviewed by a qualified professional before running a public service.</p>
        <S t="Using MarketLink"><p>You must provide accurate information and keep your login private. Farmer accounts must be approved by an administrator before they can sell.</p></S>
        <S t="Pre-orders and pickup"><p>Placing an order reserves stock for your chosen pickup slot. Payment is made to the farmer on pickup. You may cancel until the farmer starts preparing your order; cancelled orders return stock to the farmer.</p></S>
        <S t="Farmers"><p>Farmers are responsible for the accuracy of listings, stock, prices and food safety. Listings that mislead customers may be hidden and accounts suspended.</p></S>
        <S t="Reviews"><p>Reviews must be honest and respectful. Verified-purchase badges are only given for completed orders. Spam, links and abusive content may be held for moderation or removed.</p></S>
        <S t="Estimates and AI features"><p>Demand forecasts, waste alerts and assistant answers are aids, not guarantees. Assistant answers are built from marketplace data and may be out of date by the time you pick up.</p></S>
        <S t="Changes"><p>These terms may change; continued use means you accept the updated terms.</p></S>
      </div>
    </PageLayout>
  )
}
