// Favorites are stored as small snapshots so the list still renders if the
// source entity changes: { id, type, name, image, metadata }.

export const FAVORITE_TYPES = ['product', 'farmer', 'market']

/** Normalises a product / farmer / market record into a favorite object. */
export function toFavorite(type, entity) {
  if (type === 'product') {
    return {
      id: entity.id,
      type,
      name: entity.name,
      image: entity.images?.[0] ?? entity.image ?? null,
      metadata: { category: entity.category, price: entity.price, unit: entity.unit, farmer: entity.farmer?.name }
    }
  }
  if (type === 'farmer') {
    return {
      id: entity.id,
      type,
      name: entity.name,
      image: entity.image ?? null,
      metadata: { farm: entity.farm, specialty: entity.specialty, rating: entity.rating }
    }
  }
  return {
    id: entity.id,
    type: 'market',
    name: entity.name,
    image: entity.image ?? null,
    metadata: { location: entity.location, distanceKm: entity.distanceKm, rating: entity.rating }
  }
}

export const favoriteKey = (type, id) => `${type}:${id}`

// Nothing is pre-favorited: the heart states you see are your own.
export const initialFavorites = []
