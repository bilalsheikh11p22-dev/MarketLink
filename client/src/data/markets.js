// Static option lists used by the market UI. Real market records come from the API.
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Mock location selector options. "Karachi" = the whole city (no location filter).
export const LOCATION_OPTIONS = ['Karachi', 'Clifton', 'DHA', 'Gulshan', 'Malir', 'North Nazimabad']

// Approximate neighbourhood centres, used only to place labels on the
// placeholder map so it looks like a real city map.
export const AREA_COORDINATES = {
  Clifton: { lat: 24.8138, lng: 67.0308 },
  DHA: { lat: 24.8, lng: 67.07 },
  Saddar: { lat: 24.8607, lng: 67.0104 },
  Garden: { lat: 24.8744, lng: 67.0199 },
  Gulshan: { lat: 24.9215, lng: 67.0932 },
  Malir: { lat: 24.8935, lng: 67.1976 },
  'North Nazimabad': { lat: 24.937, lng: 67.0392 }
}

export const KARACHI_CENTER = { lat: 24.868, lng: 67.09 }

