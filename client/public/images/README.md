# MarketLink image folders

## Static images (shipped with the frontend, referenced as `/images/...`)
| Folder | Purpose | Notes |
|---|---|---|
| `logo/` | Brand logo files | e.g. `logo.svg`, `logo-mark.svg` |
| `hero/` | Home hero / page hero backgrounds | |
| `story/cinematic/` | Cinematic scene art | |
| `story/farmers`, `story/products` | Story-section photography | existing `story/*.jpg` stay where they are |
| `markets/` | Static market cover + gallery photos | existing files, see `markets/README.md` |
| `farmers/` | Static farmer portraits (`farmer-1.jpg` ...) | |
| `products/{vegetables,fruits,dairy,other}/` | Static product photos | |
| `categories/` | Category thumbnails | e.g. `vegetables.jpg`, `fruits.jpg`, `dairy.jpg`, `herbs.jpg` |
| `banners/` | Promotional banners | |
| `about/` | About / Contact page photography | `about-hero.jpg`, `contact-hero.jpg` |
| `testimonials/`, `avatars/`, `dashboard/` | Misc. | |
| `placeholders/` | **Provided.** Local SVG placeholders used whenever an image is missing | `product.svg farmer.svg market.svg avatar.svg generic.svg` |

## Dynamic images (served by the BACKEND, not stored here)
Put real files in `server/uploads/images/<folder>/` and store the returned path
(e.g. `/uploads/images/products/organic-tomatoes.jpg`) on the record. See `server/uploads/README.md`.
