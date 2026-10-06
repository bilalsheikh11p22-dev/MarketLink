import MapPlaceholder from './MapPlaceholder.jsx'
import { MAP_PROVIDER } from './mapConfig.js'

/**
 * Provider-agnostic map facade used by MarketMap page, MarketLocation
 * and NearbyMarkets.
 *
 * @param {object}   props
 * @param {object}   [props.market]       Single market to show (centres on it).
 * @param {object[]} [props.markets]      Multiple markets (overview map).
 * @param {{lat:number,lng:number}} [props.center]  Override map centre.
 * @param {number}   [props.zoom=14]      Initial zoom level (12–17).
 * @param {string}   [props.activeId]     Highlighted market id (multi mode).
 * @param {(id:string)=>void} [props.onSelect]  Called when a pin is chosen.
 * @param {boolean}  [props.showPopup=true]     Show the market popup card.
 * @param {boolean}  [props.controls=true]      Show zoom controls.
 * @param {boolean}  [props.linkToMarket=false] Popup shows "View Market".
 * @param {string}   [props.height]       Tailwind height classes.
 * @param {string}   [props.className]
 */
export default function MarketMap(props) {
  // Only markets with real, admin-supplied coordinates are ever plotted. Nothing is invented.
  const list = props.markets ?? (props.market ? [props.market] : [])
  const plottable = list.filter((m) => m?.coordinates)
  if (plottable.length === 0) {
    return (
      <div role="status" className={`flex items-center justify-center bg-forest/5 p-8 text-center text-sm text-forest-deep/70 ${props.height || 'h-64'} ${props.className || ''}`}>
        Map coordinates have not been provided for {list.length > 1 ? 'these markets' : 'this market'} yet.
      </div>
    )
  }
  props = props.markets ? { ...props, markets: plottable } : props
  switch (MAP_PROVIDER) {
    // case 'google': return <GoogleMapView {...props} />
    // case 'osm':    return <OsmMapView {...props} />
    default:
      return <MapPlaceholder {...props} />
  }
}
