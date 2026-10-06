// OpenAPI 3.0 description of the MarketLink API. Served by Swagger UI at /api/docs and as JSON at /api/docs.json.
const ok = (desc = 'Success') => ({ 200: { description: desc, content: { 'application/json': { schema: { $ref: '#/components/schemas/Envelope' } } } } })
const err = { 400: { $ref: '#/components/responses/Error' }, 401: { $ref: '#/components/responses/Error' }, 403: { $ref: '#/components/responses/Error' }, 404: { $ref: '#/components/responses/Error' }, 409: { $ref: '#/components/responses/Error' }, 422: { $ref: '#/components/responses/Error' } }
const jsonBody = (example, required = true) => ({ required, content: { 'application/json': { schema: { type: 'object' }, example } } })
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-f0-9]{24}$' } }
const q = (name, description, type = 'string') => ({ name, in: 'query', description, schema: { type } })
const PAGING = [q('page', 'Page number (default 1)', 'integer'), q('limit', 'Page size (default 20, max 100)', 'integer')]

function op(tag, summary, { auth = null, roles, params = [], body, example201 = false, extra = {} } = {}) {
  const o = { tags: [tag], summary, parameters: params, responses: { ...ok(), ...(example201 ? { 201: ok('Created')[200] } : {}), ...err }, ...extra }
  if (auth) { o.security = [{ bearerAuth: [] }]; o.description = `Requires authentication${roles ? ` with role: ${roles.join(' or ')}` : ''}.` + (extra.note ? ` ${extra.note}` : '') }
  if (body) o.requestBody = body
  return o
}
const A = { auth: true }
const F = { auth: true, roles: ['farmer'] }
const FA = { auth: true, roles: ['farmer (approved)', 'admin'] }
const AD = { auth: true, roles: ['admin'] }

const paths = {
  '/health': { get: { tags: ['System'], summary: 'Health check', responses: ok('API and database status') } },
  '/auth/register': { post: op('Authentication', 'Register a customer or farmer (farmers start as pending approval)', { body: jsonBody({ name: 'Sara Customer', email: 'sara@example.com', password: 'secret123', role: 'customer' }), example201: true }) },
  '/auth/login': { post: op('Authentication', 'Log in and receive a JWT', { body: jsonBody({ email: 'customer@marketlink.com', password: 'password123' }) }) },
  '/auth/me': { get: op('Authentication', 'Current user', A) },
  '/auth/profile': { put: op('Authentication', 'Update own profile / language', { ...A, body: jsonBody({ name: 'Sara', phone: '0300-0000002', city: 'Karachi', language: 'roman' }) }) },
  '/auth/forgot-password': { post: op('Authentication', 'Request a password-reset OTP', { body: jsonBody({ email: 'customer@marketlink.com' }) }) },
  '/auth/verify-otp': { post: op('Authentication', 'Verify reset OTP', { body: jsonBody({ email: 'customer@marketlink.com', code: '123456' }) }) },
  '/auth/reset-password': { post: op('Authentication', 'Reset password with OTP', { body: jsonBody({ email: 'customer@marketlink.com', code: '123456', password: 'newSecret123' }) }) },
  '/products': {
    get: op('Products', 'List products (search, filter, sort, paginate)', { params: [...PAGING, q('search', 'Text search'), q('category', 'Category'), q('market', 'Market id'), q('farmer', 'Farmer id'), q('minPrice', 'Min price', 'number'), q('maxPrice', 'Max price', 'number'), q('inStock', 'true = only in stock', 'boolean'), q('sort', 'newest | price_asc | price_desc | rating | popular | name')] }),
    post: op('Products', 'Create a product', { ...FA, body: jsonBody({ name: 'Organic Tomatoes', price: 180, unit: 'kg', category: 'Vegetables', stock: 50, images: ['/uploads/images/products/tomatoes.jpg'] }), example201: true })
  },
  '/products/categories': { get: op('Products', 'Categories with product counts') },
  '/products/nearby': { get: op('Location', 'Products at markets within a radius', { params: [q('lat', 'Latitude', 'number'), q('lng', 'Longitude', 'number'), q('radius', 'Radius in km (default 5)', 'number')] }) },
  '/products/{id}': { get: op('Products', 'Product details + related', { params: [idParam] }), put: op('Products', 'Update own product', { ...FA, params: [idParam], body: jsonBody({ price: 190, discountPercent: 15 }) }), delete: op('Products', 'Remove (hide) product', { ...FA, params: [idParam] }) },
  '/products/{id}/stock': { patch: op('Inventory', 'Set absolute stock or add a delta', { ...FA, params: [idParam], body: jsonBody({ delta: 20 }) }) },
  '/markets': { get: op('Markets', 'List markets', { params: [...PAGING, q('search', 'Name search')] }), post: op('Markets', 'Create market', { ...AD, body: jsonBody({ name: 'Green Valley Market', lat: 24.86, lng: 67.01, openingTime: '08:00', closingTime: '18:00' }), example201: true }) },
  '/markets/nearby': { get: op('Location', 'Markets within radius of coordinates (5 km filter: radius=5)', { params: [q('lat', 'Latitude', 'number'), q('lng', 'Longitude', 'number'), q('radius', 'Radius km (default 5)', 'number')] }) },
  '/markets/{id}': { get: op('Markets', 'Market details', { params: [idParam] }), put: op('Markets', 'Update market', { ...AD, params: [idParam], body: jsonBody({ lat: 24.86, lng: 67.01 }) }), delete: op('Markets', 'Deactivate market', { ...AD, params: [idParam] }) },
  '/markets/{id}/farmers': { get: op('Markets', 'Approved farmers at a market', { params: [idParam] }) },
  '/markets/{id}/products': { get: op('Markets', 'Products at a market', { params: [idParam, ...PAGING] }) },
  '/markets/{id}/analytics': { get: op('Analytics', 'Market performance for a date range', { params: [idParam, q('days', 'Range in days (default 30)', 'integer')] }) },
  '/farmers': { get: op('Farmers', 'Approved farmers', { params: [...PAGING, q('market', 'Market id')] }) },
  '/farmers/{id}': { get: op('Farmers', 'Farmer profile', { params: [idParam] }) },
  '/farmers/{id}/products': { get: op('Farmers', 'Farmer products', { params: [idParam] }) },
  '/farmers/{id}/pickup-slots': { get: op('Pickup', 'Slots and remaining capacity for a date', { params: [idParam, q('date', 'YYYY-MM-DD')] }) },
  '/farmers/me/dashboard': { get: op('Farmer', 'Farmer dashboard summary', F) },
  '/farmers/me/profile': { put: op('Farmer', 'Update own farm profile', { ...F, body: jsonBody({ businessName: 'Khan Organic Farm', farmImage: '/uploads/images/farms/khan.jpg' }) }) },
  '/farmers/me/products': { get: op('Farmer', 'Own products', { ...F, params: PAGING }) },
  '/farmers/me/pickup-slots': { get: op('Pickup', 'Own pickup slots', F), put: op('Pickup', 'Replace pickup slots', { ...F, body: jsonBody({ slots: [{ day: 'Sat', start: '09:00', end: '10:00', capacity: 5 }] }) }) },
  '/farmers/me/analytics': { get: op('Analytics', 'Farmer analytics', { ...F, params: [q('days', 'Range in days', 'integer')] }) },
  '/farmers/me/forecast': { get: op('Analytics', 'Weekly demand forecast (weighted moving average, labelled estimate)', { ...F, params: [q('weeks', 'History weeks', 'integer')] }) },
  '/farmers/me/waste': { get: op('Waste', 'Excess-stock alerts, suggested discounts and promotion analytics', F) },
  '/cart': { get: op('Cart', 'Get cart', A), post: op('Cart', 'Add to cart (stock validated)', { ...A, body: jsonBody({ productId: '64f0c0ffee0000000000abcd', quantity: 2 }) }), delete: op('Cart', 'Clear cart', A) },
  '/cart/{productId}': { put: op('Cart', 'Set item quantity', { ...A, params: [{ ...idParam, name: 'productId' }], body: jsonBody({ quantity: 3 }) }), delete: op('Cart', 'Remove item', { ...A, params: [{ ...idParam, name: 'productId' }] }) },
  '/orders': {
    get: op('Orders', 'List own orders (customer), farm orders (farmer) or all (admin)', { ...A, params: [...PAGING, q('status', 'Filter by status')] }),
    post: op('Orders', 'Place a pre-order. Stock is reserved atomically; the order is split per farmer; prices are computed on the server. Pay on pickup.', { ...A, roles: ['customer'], body: jsonBody({ pickupDate: '2026-10-10', pickupTime: '09:00-10:00', pickupLocation: 'Green Valley Market', idempotencyKey: 'checkout-7f3a', items: [{ productId: '64f0c0ffee0000000000abcd', quantity: 2 }] }), example201: true })
  },
  '/orders/queue': { get: op('Orders', 'Farmer pickup queue for a date', { ...F, params: [q('date', 'YYYY-MM-DD (default today)')] }) },
  '/orders/{id}': { get: op('Orders', 'Order details', { ...A, params: [idParam] }) },
  '/orders/{id}/pickup-code': { get: op('Orders', 'Customer-only QR payload for pickup verification', { ...A, roles: ['customer'], params: [idParam] }) },
  '/orders/{id}/cancel': { put: op('Orders', 'Customer cancels (pending/confirmed/accepted only); stock is restored once', { ...A, roles: ['customer'], params: [idParam] }) },
  '/orders/{id}/status': { put: op('Orders', 'Advance status (validated transitions)', { ...FA, params: [idParam], body: jsonBody({ status: 'accepted' }) }) },
  '/orders/{id}/verify-pickup': { post: op('Orders', 'Verify the customer QR code and complete the order', { ...FA, params: [idParam], body: jsonBody({ token: 'ML|<orderId>|<token>' }) }) },
  '/reviews/product/{id}': { get: op('Reviews', 'Published reviews for a product', { params: [idParam, ...PAGING] }) },
  '/reviews/me': { get: op('Reviews', 'My reviews', A) },
  '/reviews/farmer/{id}': { get: op('Reviews', 'Published reviews of a farmer', { params: [idParam] }) },
  '/reviews/farmer/me': { get: op('Reviews', 'Reviews of my farm', F) },
  '/reviews': { post: op('Reviews', 'Create review. verifiedPurchase is derived server-side from a completed order. Spam-flagged reviews wait for moderation.', { ...A, roles: ['customer'], body: jsonBody({ productId: '64f0c0ffee0000000000abcd', rating: 5, comment: 'Very fresh' }), example201: true }) },
  '/reviews/{id}/reply': { put: op('Reviews', 'Farmer reply', { ...F, params: [idParam], body: jsonBody({ text: 'Thank you!' }) }) },
  '/reviews/{id}/reply-delete': { delete: op('Reviews', 'Remove my reply (DELETE /reviews/{id}/reply)', { ...F, params: [idParam] }) },
  '/reviews/{id}': { put: op('Reviews', 'Edit own review (re-checked for spam)', { ...A, params: [idParam], body: jsonBody({ rating: 4, comment: 'Updated' }) }), delete: op('Reviews', 'Delete own review (admin: any)', { ...A, params: [idParam] }) },
  '/favorites': { get: op('Favorites', 'List favourites', A), post: op('Favorites', 'Add favourite', { ...A, body: jsonBody({ targetType: 'product', target: '64f0c0ffee0000000000abcd' }), example201: true }) },
  '/favorites/{type}/{id}': { delete: op('Favorites', 'Remove favourite', { ...A, params: [{ name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['product', 'farmer', 'market'] } }, idParam] }) },
  '/notifications': { get: op('Notifications', 'List notifications (with unread count)', { ...A, params: [...PAGING, q('unread', 'true = unread only', 'boolean')] }) },
  '/notifications/preferences': { get: op('Notifications', 'Get preferences', A), put: op('Notifications', 'Update preferences', { ...A, body: jsonBody({ order: true, pickup: true, stock: false, restock: true, email: false }) }) },
  '/notifications/read-all': { put: op('Notifications', 'Mark all read', A) },
  '/notifications/{id}/read': { put: op('Notifications', 'Mark one read', { ...A, params: [idParam] }) },
  '/notifications/{id}': { delete: op('Notifications', 'Delete one', { ...A, params: [idParam] }) },
  '/notifications/stream': { get: { tags: ['Notifications'], summary: 'Server-Sent Events stream of live notifications (JWT in ?token=)', parameters: [q('token', 'JWT')], responses: { 200: { description: 'text/event-stream' }, 401: err[401] } } },
  '/ai/chat': { post: op('AI', 'Database-grounded customer assistant. Uses real products/markets; calls an LLM only when ANTHROPIC_API_KEY or OPENAI_API_KEY is set, otherwise answers from data.', { body: jsonBody({ message: 'vegetables under 300 rupees', language: 'en', lat: 24.86, lng: 67.01 }) }) },
  '/ai/farmer-chat': { post: op('AI', 'Farmer business assistant (stock, demand, waste, sales)', { ...F, body: jsonBody({ message: 'what should I restock?' }) }) },
  '/ai/history': { get: op('AI', 'Chat history', { ...A, params: [q('scope', 'customer | farmer')] }), delete: op('AI', 'Clear chat history', A) },
  '/insights/me': { get: op('Analytics', 'Personalised customer insights and recommendations', A) },
  '/contact': { post: op('Public', 'Submit contact form', { body: jsonBody({ name: 'Sara', email: 'sara@example.com', subject: 'Question', message: 'Hello, I have a question about pickup.' }), example201: true }) },
  '/uploads/images/{folder}': { post: { tags: ['Uploads'], summary: 'Upload an image (multipart field "image", JPEG/PNG/WebP, max 5 MB). Returns a relative path to store on the record.', security: [{ bearerAuth: [] }], parameters: [{ name: 'folder', in: 'path', required: true, schema: { type: 'string', enum: ['products', 'farmers', 'farms', 'markets', 'avatars'] } }], requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } } } }, responses: { ...ok(), ...err, 413: { $ref: '#/components/responses/Error' } } } },
  '/uploads/images': { get: op('Uploads', 'List files present in the uploads folders', AD) },
  '/admin/dashboard': { get: op('Admin', 'Platform summary', AD) },
  '/admin/users': { get: op('Admin', 'Users (search, role, paginate)', { ...AD, params: [...PAGING, q('role', 'customer|farmer|admin'), q('search', 'Name/email')] }) },
  '/admin/users/{id}': { put: op('Admin', 'Activate/deactivate or change role (audited)', { ...AD, params: [idParam], body: jsonBody({ isActive: false }) }) },
  '/admin/farmers': { get: op('Admin', 'Farmers incl. pending', { ...AD, params: [...PAGING, q('status', 'pending|approved|rejected|suspended')] }) },
  '/admin/farmers/{id}': { put: op('Admin', 'Approve/reject/suspend a farmer (audited, notifies farmer)', { ...AD, params: [idParam], body: jsonBody({ verificationStatus: 'approved' }) }) },
  '/admin/products': { get: op('Admin', 'All products', { ...AD, params: PAGING }) },
  '/admin/orders': { get: op('Admin', 'All orders', { ...AD, params: [...PAGING, q('status', 'Status')] }) },
  '/admin/reviews': { get: op('Admin', 'Review moderation queue + analytics', { ...AD, params: [...PAGING, q('status', 'published|pending|hidden'), q('flagged', 'true = spam-flagged', 'boolean')] }) },
  '/admin/reviews/{id}': { put: op('Admin', 'Publish/hide a review', { ...AD, params: [idParam], body: jsonBody({ status: 'hidden' }) }) },
  '/admin/analytics': { get: op('Analytics', 'Platform analytics for a date range', { ...AD, params: [q('days', 'Range in days', 'integer')] }) },
  '/admin/impact': { get: op('Waste', 'Impact dashboard (only defined, computable metrics)', { ...AD, params: [q('days', 'Range in days', 'integer')] }) },
  '/admin/audit-logs': { get: op('Admin', 'Administrative activity log', { ...AD, params: [...PAGING, q('action', 'Action prefix, e.g. farmer.')] }) },
  '/admin/reports/{type}': { get: op('Admin', 'CSV export (orders | products | users)', { ...AD, params: [{ name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['orders', 'products', 'users'] } }] }) },
  '/admin/notifications/broadcast': { post: op('Admin', 'Broadcast an in-app notification', { ...AD, body: jsonBody({ title: 'Market closed Friday', message: 'Eid holiday', audience: 'all' }) }) },
  '/admin/notifications/stats': { get: op('Admin', 'Notification statistics', AD) },
  '/admin/contact-messages': { get: op('Admin', 'Contact form submissions', { ...AD, params: PAGING }) }
}

export const openapi = {
  openapi: '3.0.3',
  info: { title: 'MarketLink API', version: '1.0.0', description: 'Local agricultural marketplace API. All JSON responses use `{ success, message, data }`; errors use `{ success:false, message, errors? }`. Payment is pay-on-pickup only.' },
  servers: [{ url: '/api', description: 'This server' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: { Envelope: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object' } } } },
    responses: { Error: { description: 'Error', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: false }, message: { type: 'string' } } } } } } }
  },
  paths
}
