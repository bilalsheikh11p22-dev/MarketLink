// Scene data for the cinematic scroll experience on the homepage.
// Keep this separate from UI components so content can be edited
// without touching animation or layout logic.

export const landingScenes = [
  {
    id: 1,
    eyebrow: 'Local · Fresh · Connected',
    title: 'From Local Farms to Your Table',
    description:
      'Discover fresh products from farmers and markets around you — grown nearby, picked up on your time.',
    image: '/images/story/farm-fresh.jpg',
      icon: 'sprout',
    align: 'left'
  },
  {
    id: 2,
    eyebrow: 'The Growers',
    title: 'Meet Local Farmers',
    description:
      'Discover trusted local farmers and explore what they grow, season by season, field by field.',
      image: '/images/story/local-farm.jpg',
      icon: 'users',
    align: 'right'
  },
  {
    id: 3,
    eyebrow: 'The Harvest',
    title: 'Find Fresh Products',
    description:
      'Browse fresh products, check availability and discover what is nearby before you ever leave home.',
     image: '/images/story/fresh-carrot.jpg',
      icon: 'carrot',
    align: 'left'
  },
  {
    id: 4,
    eyebrow: 'The Pickup',
    title: 'Pick Up When It Works for You',
    description:
      'Choose your pickup date and time before placing your pre-order, and skip the guesswork.',
    image: '/images/story/time.jpg',
 
    align: 'right'
  },
  {
    id: 5,
    eyebrow: 'The Community',
    title: 'Support Local. Shop Fresh.',
    description:
      'MarketLink makes local shopping simple, transparent and connected — for growers and neighbors alike.',
    image: '/images/story/local.jpg',
    align: 'left',
    cta: 'Explore Markets'
  }
]
