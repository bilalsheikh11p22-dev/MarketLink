import AppImage from './AppImage.jsx'
export default function MarketImage({ src, market, ...props }) {
  const value = src || market?.image || market?.gallery?.[0]
  return <AppImage src={value} kind="market" alt={props.alt ?? market?.name ?? ''} {...props} />
}
