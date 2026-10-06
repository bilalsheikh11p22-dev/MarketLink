// Map provider switch. Everything in the app renders <MarketMap /> and
// never talks to a map SDK directly, so moving from the placeholder to a
// real map is a change in this folder only:
//
//   'placeholder'  -> ./MapPlaceholder.jsx   (HTML/CSS/SVG, no API key)   <- current
//   'google'       -> add ./GoogleMapView.jsx   (needs a Maps JS API key)
//   'osm'          -> add ./OsmMapView.jsx      (Leaflet / OpenStreetMap tiles)
//
// A provider component receives the exact same props as MarketMap (see
// the JSDoc in MarketMap.jsx) and must render markers + a popup card.
export const MAP_PROVIDER = 'placeholder'
export const DEFAULT_ZOOM = 14
export const MIN_ZOOM = 12
export const MAX_ZOOM = 17
