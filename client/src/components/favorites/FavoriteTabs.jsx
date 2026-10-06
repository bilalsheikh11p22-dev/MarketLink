import PillTabs from '../common/PillTabs.jsx'

export default function FavoriteTabs({ value, onChange, counts }) {
  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'products', label: 'Products', count: counts.products },
    { id: 'farmers', label: 'Farmers', count: counts.farmers },
    { id: 'markets', label: 'Markets', count: counts.markets }
  ]
  return <PillTabs tabs={tabs} value={value} onChange={onChange} label="Favorites" idPrefix="fav-tab" />
}
