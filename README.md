# MarketLink

A local agricultural marketplace. Customers browse nearby markets and farmers, reserve fresh produce, and **pay when they pick it up** (no online payments). Farmers manage products, stock and pickup slots. Admins approve farmers, moderate content and see analytics.

- **Client:** React 18 + Vite + Tailwind + Framer Motion (PWA-ready)
- **Server:** Node.js (ESM) + Express + MongoDB/Mongoose, JWT auth, Swagger docs at `/api/docs`
- **Languages:** English, اردو (Urdu), Roman Urdu

## Quick start

```bash
# 1. API
cd server
cp .env.example .env        # set MONGO_URI and a long random JWT_SECRET
npm install
npm run seed                # optional demo data (see docs/SETUP.md)
npm run dev                 # http://localhost:5000  (API docs: /api/docs)

# 2. Web app
cd ../client
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

Full instructions: [docs/SETUP.md](docs/SETUP.md).

## Feature overview

| Area | What is implemented |
|---|---|
| Orders | Stock is reserved atomically at checkout (no overselling); orders split per farmer; pickup date + slot capacity; status machine (pending → accepted/confirmed → preparing → ready → completed, or cancelled); cancellation restores stock once; idempotency key prevents duplicate orders |
| Pickup | Secret QR pickup code per order, verified by the farmer; farmer pickup queue by date; same-day pickup reminder job |
| Reviews | Verified-purchase badge, one review per product per customer, farmer replies, spam scoring, admin moderation |
| Notifications | In-app + real-time (Server-Sent Events), per-category preferences, optional email |
| AI assistants | Customer and farmer assistants that answer **from database data**; an LLM (Anthropic/OpenAI) is optional and the assistants say so when none is configured |
| Forecasting & waste | Weighted-moving-average demand estimate (labelled as an estimate, with a back-test and an explicit "insufficient data" state); rule-based low-demand/expiry alerts with optional discounts |
| Location | Markets only appear on maps if an admin supplied coordinates; "near me" uses the visitor's browser location (with permission) and a 5 km radius |
| Admin | Users, farmer approvals, markets, products, orders, analytics, impact dashboard (only metrics that can be computed from stored data), audit log, CSV reports |
| Images | `AppImage`/`ProductImage`/`FarmerImage`/`MarketImage`/`ImageGallery`/`CinematicImage` with local SVG placeholders; uploads served from `/uploads` |
| PWA | Web manifest + service worker that caches only the static shell (never API data) + offline banner |

## Documentation

- [Setup & seeding](docs/SETUP.md)
- [Deployment (Vercel + Node host)](docs/DEPLOYMENT.md)
- [Architecture & ER diagram](docs/ARCHITECTURE.md)
- [Images: folders and files you must add](docs/IMAGES.md)
- User manuals: [customer](docs/MANUAL_CUSTOMER.md), [farmer](docs/MANUAL_FARMER.md), [admin](docs/MANUAL_ADMIN.md)
- [Testing report (what was and was not tested)](docs/TESTING_REPORT.md)
- [Security notes](docs/SECURITY.md)
- [Demo checklist](docs/DEMO_CHECKLIST.md)

## Known limitations

See [docs/TESTING_REPORT.md](docs/TESTING_REPORT.md#not-verified). In short: the API test-suite was run against FerretDB (a MongoDB-compatible database), not a live MongoDB Atlas cluster; nothing has been deployed; email, push and LLM providers were not exercised with real credentials; and no manual browser/device testing was done.
