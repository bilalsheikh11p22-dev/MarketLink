// Integration tests: run against a live API + seeded database.
//   API_URL=http://localhost:5055/api node --test tests/
import test from 'node:test'
import assert from 'node:assert/strict'

const API = process.env.API_URL || 'http://localhost:5000/api'
async function call(path, { method = 'GET', token, body, raw } = {}) {
  if (path === '/orders' && method === 'POST' && body && body.pickupTime === undefined) body = { ...body, pickupTime: PT }
  const res = await fetch(`${API}${path}`, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  if (raw) return res
  let json = null; try { json = await res.json() } catch { /* not json */ }
  return { status: res.status, body: json, data: json?.data }
}
const login = async (email) => (await call('/auth/login', { method: 'POST', body: { email, password: 'password123' } })).data.token
const futureDate = (daysAhead = 3) => { const d = new Date(); d.setDate(d.getDate() + daysAhead); return d.toISOString().slice(0, 10) }
const dayOf = (s) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(`${s}T00:00:00`).getDay()]

const PT = '09:00-10:00'   // slot configured for both farmers in before()
const T = {}
test.before(async () => {
  T.admin = await login('admin@marketlink.com'); T.customer = await login('customer@marketlink.com')
  T.farmer = await login('ahmed@example.com'); T.farmer2 = await login('ayesha@example.com')
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const slots = days.flatMap((day) => [{ day, start: '09:00', end: '10:00', capacity: 100 }, { day, start: '11:00', end: '12:00', capacity: 2 }])
  assert.equal((await call('/farmers/me/pickup-slots', { method: 'PUT', token: T.farmer, body: { slots } })).status, 200)
  assert.equal((await call('/farmers/me/pickup-slots', { method: 'PUT', token: T.farmer2, body: { slots } })).status, 200)
  assert.equal((await call('/farmers/me/pickup-slots', { method: 'PUT', token: T.farmer2, body: { slots: [{ day: 'Mon', start: '10:00', end: '09:00' }] } })).status, 422)
  const list = (await call('/products?limit=50')).data.items
  T.tomato = list.find((p) => p.name === 'Organic Tomatoes'); T.mint = list.find((p) => p.name === 'Fresh Mint'); T.milk = list.find((p) => p.name === 'Buffalo Milk')
})

test('health endpoint reports database connectivity', async () => {
  const r = await call('/health'); assert.equal(r.status, 200); assert.equal(r.body.database, 'connected')
})

test('auth: register customer, duplicate email rejected, bad input rejected, weak password rejected', async () => {
  const email = `t${Date.now()}@example.com`
  const ok = await call('/auth/register', { method: 'POST', body: { name: 'Test User', email, password: 'secret123' } })
  assert.equal(ok.status, 201); assert.ok(ok.data.token); assert.equal(ok.data.user.role, 'customer'); assert.equal(ok.data.user.password, undefined)
  assert.equal((await call('/auth/register', { method: 'POST', body: { name: 'T', email, password: 'secret123' } })).status, 409)
  assert.equal((await call('/auth/register', { method: 'POST', body: { name: 'T', email: 'bad', password: 'secret123' } })).status, 422)
  assert.equal((await call('/auth/register', { method: 'POST', body: { name: 'T', email: 'x@y.com', password: '123' } })).status, 400)
  // role escalation attempt must be ignored
  const adm = await call('/auth/register', { method: 'POST', body: { name: 'Evil', email: `e${Date.now()}@example.com`, password: 'secret123', role: 'admin' } })
  assert.equal(adm.data.user.role, 'customer')
})

test('auth: wrong password -> 401, no token -> 401, garbage token -> 401', async () => {
  assert.equal((await call('/auth/login', { method: 'POST', body: { email: 'customer@marketlink.com', password: 'nope' } })).status, 401)
  assert.equal((await call('/auth/me')).status, 401)
  assert.equal((await call('/auth/me', { token: 'abc.def.ghi' })).status, 401)
})

test('NoSQL operator injection in login is neutralised', async () => {
  const r = await call('/auth/login', { method: 'POST', body: { email: { $gt: '' }, password: { $gt: '' } } })
  assert.ok([400, 401, 422].includes(r.status), `got ${r.status}`)
})

test('farmer registration is pending and cannot log in until approved; admin approves; suspended blocked', async () => {
  const email = `f${Date.now()}@example.com`
  const reg = await call('/auth/register', { method: 'POST', body: { name: 'New Farmer', email, password: 'secret123', role: 'farmer', farmName: 'Test Farm' } })
  assert.equal(reg.status, 201); assert.equal(reg.data.pending, true); assert.equal(reg.data.token, undefined)
  assert.equal((await call('/auth/login', { method: 'POST', body: { email, password: 'secret123' } })).status, 403)
  const farmers = (await call('/admin/farmers?status=pending', { token: T.admin })).data.farmers
  const f = farmers.find((x) => x.user.email === email); assert.ok(f)
  assert.equal((await call(`/admin/farmers/${f._id}`, { method: 'PUT', token: T.admin, body: { verificationStatus: 'approved' } })).status, 200)
  const ftoken = (await call('/auth/login', { method: 'POST', body: { email, password: 'secret123' } })).data.token
  assert.ok(ftoken)
  assert.equal((await call('/farmers/me/dashboard', { token: ftoken })).status, 200)
  await call(`/admin/farmers/${f._id}`, { method: 'PUT', token: T.admin, body: { verificationStatus: 'suspended' } })
  assert.equal((await call('/auth/login', { method: 'POST', body: { email, password: 'secret123' } })).status, 403)
  // an already-issued token of a suspended farmer is blocked on restricted routes
  assert.equal((await call('/farmers/me/dashboard', { token: ftoken })).status, 403)
  assert.equal((await call('/products', { method: 'POST', token: ftoken, body: { name: 'Sneaky', price: 5 } })).status, 403)
})

test('role authorisation: customer cannot reach admin/farmer endpoints; farmer cannot reach admin', async () => {
  assert.equal((await call('/admin/users', { token: T.customer })).status, 403)
  assert.equal((await call('/admin/users', { token: T.farmer })).status, 403)
  assert.equal((await call('/farmers/me/dashboard', { token: T.customer })).status, 403)
  assert.equal((await call('/products', { method: 'POST', token: T.customer, body: { name: 'x', price: 1 } })).status, 403)
  assert.equal((await call('/admin/users', { token: T.admin })).status, 200)
})

test('markets/farmers/products browsing, filter, sort, pagination', async () => {
  assert.ok((await call('/markets')).data.markets.length >= 3)
  assert.ok((await call('/farmers')).data.farmers.length >= 2)
  const asc = (await call('/products?sort=price_asc&limit=3')).data
  assert.equal(asc.items.length, 3); assert.ok(asc.items[0].price <= asc.items[1].price); assert.equal(asc.pagination.limit, 3)
  assert.ok((await call('/products?category=Dairy')).data.items.every((p) => p.category === 'Dairy'))
  assert.ok((await call('/products?search=mint')).data.items.some((p) => p.name === 'Fresh Mint'))
  assert.ok((await call('/products?maxPrice=50')).data.items.every((p) => p.price <= 50))
  assert.equal((await call('/products/notanid')).status, 422)
  // public farmer responses must not leak email
  const fr = (await call('/farmers')).data.farmers[0]; assert.equal(fr.user.email, undefined)
})

test('nearby markets: radius filter (5 km) uses real coordinates and does not invent any', async () => {
  const near = (await call('/markets/nearby?lat=24.8138&lng=67.0300&radius=5')).data
  assert.ok(near.markets.length >= 1); assert.equal(near.markets[0].name, 'Clifton Fresh Market'); assert.ok(near.markets[0].distanceKm < 1)
  assert.ok(near.markets.every((m) => m.distanceKm <= 5))
  assert.equal((await call('/markets/nearby')).status, 422)
})

test('farmer product CRUD with ownership checks', async () => {
  const created = await call('/products', { method: 'POST', token: T.farmer, body: { name: 'Test Okra', price: 100, unit: 'kg', stock: 5, category: 'Vegetables' } })
  assert.equal(created.status, 201); const id = created.data.product._id
  assert.equal(created.data.product.availability, 'low_stock')
  assert.equal((await call(`/products/${id}`, { method: 'PUT', token: T.farmer2, body: { price: 1 } })).status, 403, 'other farmer must not edit')
  assert.equal((await call(`/products/${id}`, { method: 'PUT', token: T.farmer, body: { price: 120 } })).data.product.price, 120)
  assert.equal((await call(`/products/${id}`, { method: 'PUT', token: T.farmer, body: { price: -5 } })).status, 422)
  assert.equal((await call(`/products/${id}/stock`, { method: 'PATCH', token: T.farmer, body: { delta: 100 } })).data.product.availability, 'in_stock')
  assert.equal((await call(`/products/${id}/stock`, { method: 'PATCH', token: T.farmer, body: { delta: -1000 } })).status, 422)
  assert.equal((await call(`/products/${id}`, { method: 'DELETE', token: T.farmer2 })).status, 403)
  assert.equal((await call(`/products/${id}`, { method: 'DELETE', token: T.farmer })).status, 200)
  assert.equal((await call(`/products/${id}`)).status, 404)
})

test('cart: stock enforced, quantities validated', async () => {
  await call('/cart', { method: 'DELETE', token: T.customer })
  assert.equal((await call('/cart', { method: 'POST', token: T.customer, body: { productId: T.mint._id, quantity: 2 } })).status, 200)
  assert.equal((await call('/cart', { method: 'POST', token: T.customer, body: { productId: T.mint._id, quantity: 100000 } })).status, 409)
  assert.equal((await call('/cart', { method: 'POST', token: T.customer, body: { productId: T.mint._id, quantity: -1 } })).status, 422)
  assert.equal((await call('/cart', { method: 'POST', token: T.customer, body: { productId: T.mint._id, quantity: 1.5 } })).status, 422)
  const cart = (await call('/cart', { token: T.customer })).data
  assert.equal(cart.subtotal, 80)
  await call('/cart', { method: 'DELETE', token: T.customer })
})

let order1
test('checkout: server-side prices, per-farmer split, stock reservation, notifications, idempotency', async () => {
  const date = futureDate(3)
  const before = (await call(`/products/${T.tomato._id}`)).data.product.stock
  const body = { pickupDate: date, idempotencyKey: `k-${Date.now()}`, notes: 'test', items: [{ productId: T.tomato._id, quantity: 2 }, { productId: T.mint._id, quantity: 3 }], price: 1, total: 1 }
  const r = await call('/orders', { method: 'POST', token: T.customer, body })
  assert.equal(r.status, 201, JSON.stringify(r.body))
  assert.equal(r.data.orders.length, 2, 'split into one order per farmer')
  const tomatoOrder = r.data.orders.find((o) => o.items[0].name === 'Organic Tomatoes'); order1 = tomatoOrder
  assert.equal(tomatoOrder.total, 360, 'client-sent price/total ignored')
  assert.equal(r.data.orders.find((o) => o.items[0].name === 'Fresh Mint').total, 120)
  assert.equal(tomatoOrder.status, 'pending'); assert.equal(tomatoOrder.paymentStatus, 'pay_on_pickup')
  assert.equal(tomatoOrder.pickupToken, undefined, 'pickup secret is never returned in the order body')
  assert.equal((await call(`/products/${T.tomato._id}`)).data.product.stock, before - 2)
  const again = await call('/orders', { method: 'POST', token: T.customer, body })
  assert.equal(again.data.duplicate, true); assert.equal((await call(`/products/${T.tomato._id}`)).data.product.stock, before - 2, 'retry must not reserve twice')
  const notes = (await call('/notifications', { token: T.customer })).data
  assert.ok(notes.notifications.some((n) => n.title === 'Order placed')); assert.ok(notes.unread >= 1)
  const fnotes = (await call('/notifications', { token: T.farmer })).data
  assert.ok(fnotes.notifications.some((n) => n.title === 'New order'))
})

test('checkout validation: farmers cannot order, past dates and bad quantities rejected, empty cart rejected', async () => {
  assert.equal((await call('/orders', { method: 'POST', token: T.farmer, body: { pickupDate: futureDate(2), items: [{ productId: T.mint._id, quantity: 1 }] } })).status, 403)
  assert.equal((await call('/orders', { method: 'POST', token: T.customer, body: { pickupDate: '2020-01-01', items: [{ productId: T.mint._id, quantity: 1 }] } })).status, 422)
  assert.equal((await call('/orders', { method: 'POST', token: T.customer, body: { pickupDate: futureDate(2), items: [{ productId: T.mint._id, quantity: 0 }] } })).status, 422)
  await call('/cart', { method: 'DELETE', token: T.customer })
  assert.equal((await call('/orders', { method: 'POST', token: T.customer, body: { pickupDate: futureDate(2) } })).status, 400)
})

test('OVERSELLING: concurrent orders can never exceed stock', async () => {
  const p = (await call('/products', { method: 'POST', token: T.farmer, body: { name: `Scarce ${Date.now()}`, price: 10, unit: 'kg', stock: 5 } })).data.product
  const date = futureDate(4)
  const attempts = await Promise.all(Array.from({ length: 12 }, () => call('/orders', { method: 'POST', token: T.customer, body: { pickupDate: date, items: [{ productId: p._id, quantity: 1 }] } })))
  const ok = attempts.filter((a) => a.status === 201).length, rejected = attempts.filter((a) => a.status === 409).length
  assert.equal(ok, 5, `exactly the 5 units in stock should sell, got ${ok}`)
  assert.equal(rejected, 7)
  const after = (await call(`/products/${p._id}`)).data.product
  assert.equal(after.stock, 0); assert.equal(after.availability, 'out_of_stock')
  T.scarce = p
})

test('multi-item order is all-or-nothing: failure on one line restores earlier reservations', async () => {
  const beforeMint = (await call(`/products/${T.mint._id}`)).data.product.stock
  const r = await call('/orders', { method: 'POST', token: T.customer, body: { pickupDate: futureDate(4), items: [{ productId: T.mint._id, quantity: 1 }, { productId: T.scarce._id, quantity: 1 }] } })
  assert.equal(r.status, 409)
  assert.equal((await call(`/products/${T.mint._id}`)).data.product.stock, beforeMint, 'mint stock restored')
})

test('cancellation restores stock exactly once; restock alert reaches favouriting customer', async () => {
  await call('/favorites', { method: 'POST', token: T.customer, body: { targetType: 'product', target: T.scarce._id } })
  const mine = (await call('/orders?limit=100', { token: T.customer })).data.orders.filter((o) => o.items[0].name === T.scarce.name && o.status === 'pending')
  assert.equal(mine.length, 5)
  const c1 = await call(`/orders/${mine[0]._id}/cancel`, { method: 'PUT', token: T.customer }); assert.equal(c1.status, 200)
  assert.equal((await call(`/orders/${mine[0]._id}/cancel`, { method: 'PUT', token: T.customer })).status, 409, 'second cancel rejected')
  assert.equal((await call(`/products/${T.scarce._id}`)).data.product.stock, 1, 'only +1 restored')
  const n = (await call('/notifications', { token: T.customer })).data.notifications
  assert.ok(n.some((x) => x.type === 'restock'), 'restock alert expected')
  // concurrent double-cancel
  const [a, b] = await Promise.all([1, 2].map(() => call(`/orders/${mine[1]._id}/cancel`, { method: 'PUT', token: T.customer })))
  assert.equal([a.status, b.status].filter((s) => s === 200).length, 1)
  assert.equal((await call(`/products/${T.scarce._id}`)).data.product.stock, 2)
})

test('order access control: other customers and other farmers cannot read an order', async () => {
  const other = (await call('/auth/register', { method: 'POST', body: { name: 'Other', email: `o${Date.now()}@example.com`, password: 'secret123' } })).data.token
  assert.equal((await call(`/orders/${order1._id}`, { token: other })).status, 403)
  assert.equal((await call(`/orders/${order1._id}`, { token: T.farmer2 })).status, 403)
  assert.equal((await call(`/orders/${order1._id}/pickup-code`, { token: T.farmer })).status, 403)
  assert.equal((await call(`/orders/${order1._id}`, { token: T.customer })).status, 200)
  assert.equal((await call(`/orders/${order1._id}`, { token: T.farmer })).status, 200)
})

test('status machine: invalid jumps blocked; customer cannot set status; farmer cannot complete without QR', async () => {
  const id = order1._id
  assert.equal((await call(`/orders/${id}/status`, { method: 'PUT', token: T.customer, body: { status: 'ready' } })).status, 403)
  assert.equal((await call(`/orders/${id}/status`, { method: 'PUT', token: T.farmer, body: { status: 'ready' } })).status, 409, 'pending -> ready not allowed')
  assert.equal((await call(`/orders/${id}/status`, { method: 'PUT', token: T.farmer, body: { status: 'bogus' } })).status, 422)
  assert.equal((await call(`/orders/${id}/status`, { method: 'PUT', token: T.farmer2, body: { status: 'accepted' } })).status, 403)
  for (const s of ['accepted', 'preparing', 'ready']) assert.equal((await call(`/orders/${id}/status`, { method: 'PUT', token: T.farmer, body: { status: s } })).status, 200, s)
  assert.equal((await call(`/orders/${id}/status`, { method: 'PUT', token: T.farmer, body: { status: 'completed' } })).status, 400)
  assert.equal((await call(`/orders/${id}/cancel`, { method: 'PUT', token: T.customer })).status, 409, 'cannot cancel a ready order')
  const n = (await call('/notifications', { token: T.customer })).data.notifications
  assert.ok(n.some((x) => x.type === 'pickup' && /ready/i.test(x.message)))
})

test('QR pickup: wrong code rejected, correct code completes order, code unusable afterwards', async () => {
  const id = order1._id
  const code = (await call(`/orders/${id}/pickup-code`, { token: T.customer })).data.payload
  assert.match(code, /^ML\|[a-f0-9]{24}\|[a-f0-9]{32}$/)
  assert.equal((await call(`/orders/${id}/verify-pickup`, { method: 'POST', token: T.farmer, body: { token: 'ML|x|deadbeef' } })).status, 400)
  assert.equal((await call(`/orders/${id}/verify-pickup`, { method: 'POST', token: T.customer, body: { token: code } })).status, 403)
  assert.equal((await call(`/orders/${id}/verify-pickup`, { method: 'POST', token: T.farmer2, body: { token: code } })).status, 403)
  const ok = await call(`/orders/${id}/verify-pickup`, { method: 'POST', token: T.farmer, body: { token: code } })
  assert.equal(ok.status, 200); assert.equal(ok.data.order.status, 'completed')
  assert.equal((await call(`/orders/${id}/verify-pickup`, { method: 'POST', token: T.farmer, body: { token: code } })).status, 409)
  assert.equal((await call(`/orders/${id}/pickup-code`, { token: T.customer })).status, 409)
})

test('pickup slots: capacity enforced and availability endpoint reflects bookings', async () => {
  const farmerId = (await call('/farmers')).data.farmers.find((f) => f.businessName === 'Khan Organic Farm')._id
  const date = futureDate(10)
  const av = (await call(`/farmers/${farmerId}/pickup-slots?date=${date}`)).data
  assert.equal(av.slots.length, 2); const small = av.slots.find((x) => x.time === '11:00-12:00'); assert.equal(small.remaining, 2)
  const place = () => call('/orders', { method: 'POST', token: T.customer, body: { pickupDate: date, pickupTime: '11:00-12:00', items: [{ productId: T.tomato._id, quantity: 1 }] } })
  const stockBefore = (await call(`/products/${T.tomato._id}`)).data.product.stock
  assert.equal((await place()).status, 201); assert.equal((await place()).status, 201)
  const third = await place(); assert.equal(third.status, 409, 'slot is full')
  assert.equal((await call(`/products/${T.tomato._id}`)).data.product.stock, stockBefore - 2, 'failed order released its reservation')
  assert.equal((await call(`/farmers/${farmerId}/pickup-slots?date=${date}`)).data.slots.find((x) => x.time === '11:00-12:00').remaining, 0)
  const bad = await call('/orders', { method: 'POST', token: T.customer, body: { pickupDate: date, pickupTime: '03:00-04:00', items: [{ productId: T.tomato._id, quantity: 1 }] } })
  assert.equal(bad.status, 422, 'non-existent slot rejected')
})

test('pickup queue lists only the farmer\'s own orders for the date', async () => {
  const q = await call(`/orders/queue?date=${futureDate(3)}`, { token: T.farmer }); assert.equal(q.status, 200)
  assert.ok(Array.isArray(q.data.queue)); assert.equal((await call('/orders/queue', { token: T.customer })).status, 403)
})

test('reviews: only verified purchasers get the badge; duplicates and spam handled; farmer reply', async () => {
  const unverifiedUser = (await call('/auth/register', { method: 'POST', body: { name: 'Fan', email: `r${Date.now()}@example.com`, password: 'secret123' } })).data.token
  const r1 = await call('/reviews', { method: 'POST', token: unverifiedUser, body: { productId: T.tomato._id, rating: 5, comment: 'Great', verifiedPurchase: true } })
  assert.equal(r1.status, 201); assert.equal(r1.data.review.verifiedPurchase, false, 'client cannot fake verified purchase')
  const r2 = await call('/reviews', { method: 'POST', token: T.customer, body: { productId: T.tomato._id, rating: 4, comment: 'Fresh tomatoes' } })
  assert.equal(r2.status, 201); assert.equal(r2.data.review.verifiedPurchase, true, 'completed order -> verified')
  assert.equal((await call('/reviews', { method: 'POST', token: T.customer, body: { productId: T.tomato._id, rating: 4 } })).status, 409)
  assert.equal((await call('/reviews', { method: 'POST', token: T.customer, body: { productId: T.mint._id, rating: 9 } })).status, 422)
  assert.equal((await call('/reviews', { method: 'POST', token: T.farmer, body: { productId: T.mint._id, rating: 5 } })).status, 403)
  const spam = await call('/reviews', { method: 'POST', token: T.customer, body: { productId: T.mint._id, rating: 5, comment: 'BUY NOW at http://spam.example click here' } })
  assert.equal(spam.status, 201); assert.equal(spam.data.review.status, 'pending'); assert.equal(spam.data.flagged, true)
  const pub = (await call(`/reviews/product/${T.mint._id}`)).data.reviews; assert.ok(!pub.some((r) => r._id === spam.data.review._id), 'spam hidden from public')
  const queue = (await call('/admin/reviews?flagged=true', { token: T.admin })).data.reviews; assert.ok(queue.some((r) => r._id === spam.data.review._id))
  assert.equal((await call(`/admin/reviews/${spam.data.review._id}`, { method: 'PUT', token: T.admin, body: { status: 'published' } })).status, 200)
  assert.equal((await call(`/reviews/${r2.data.review._id}/reply`, { method: 'PUT', token: T.farmer2, body: { text: 'hi' } })).status, 403)
  assert.equal((await call(`/reviews/${r2.data.review._id}/reply`, { method: 'PUT', token: T.farmer, body: { text: 'Thank you!' } })).status, 200)
  const product = (await call(`/products/${T.tomato._id}`)).data.product; assert.ok(product.reviewCount >= 1); assert.ok(product.rating > 0)
})

test('favorites: add, list, idempotent add, remove', async () => {
  assert.equal((await call('/favorites', { method: 'POST', token: T.customer, body: { targetType: 'farmer', target: T.tomato.farmer._id } })).status, 201)
  assert.equal((await call('/favorites', { method: 'POST', token: T.customer, body: { targetType: 'farmer', target: T.tomato.farmer._id } })).status, 201)
  const fav = (await call('/favorites', { token: T.customer })).data.favorites; assert.equal(fav.farmers.length, 1)
  assert.equal((await call('/favorites', { method: 'POST', token: T.customer, body: { targetType: 'nope', target: T.tomato._id } })).status, 422)
  assert.equal((await call(`/favorites/farmer/${T.tomato.farmer._id}`, { method: 'DELETE', token: T.customer })).status, 200)
  assert.equal((await call('/favorites', { token: T.customer })).data.favorites.farmers.length, 0)
})

test('notifications: preferences suppress categories, mark read, unauthenticated stream refused', async () => {
  await call('/notifications/preferences', { method: 'PUT', token: T.farmer2, body: { stock: false } })
  assert.equal((await call('/notifications/preferences', { token: T.farmer2 })).data.preferences.stock, false)
  const any = (await call('/notifications', { token: T.customer })).data.notifications[0]
  assert.equal((await call(`/notifications/${any._id}/read`, { method: 'PUT', token: T.customer })).status, 200)
  assert.equal((await call(`/notifications/${any._id}/read`, { method: 'PUT', token: T.farmer })).status, 404, 'cannot touch others\' notifications')
  assert.equal((await call('/notifications/read-all', { method: 'PUT', token: T.customer })).status, 200)
  assert.equal((await call('/notifications', { token: T.customer })).data.unread, 0)
  const s = await call('/notifications/stream?token=bad', { raw: true }); assert.equal(s.status, 401)
})

test('real-time notifications: SSE stream delivers a new notification', async () => {
  const ctrl = new AbortController()
  const res = await fetch(`${API}/notifications/stream?token=${T.customer}`, { signal: ctrl.signal })
  assert.equal(res.status, 200); assert.match(res.headers.get('content-type'), /event-stream/)
  const reader = res.body.getReader(); let buf = ''
  const got = (async () => { for (;;) { const { value, done } = await reader.read(); if (done) return null; buf += new TextDecoder().decode(value); if (buf.includes('Broadcast test')) return buf } })()
  await new Promise((r) => setTimeout(r, 300))
  await call('/admin/notifications/broadcast', { method: 'POST', token: T.admin, body: { title: 'Broadcast test', audience: 'customer' } })
  const out = await Promise.race([got, new Promise((r) => setTimeout(() => r('timeout'), 4000))])
  ctrl.abort(); assert.notEqual(out, 'timeout'); assert.match(out, /event: notification/)
})

test('analytics: farmer analytics/forecast/waste return real, labelled data', async () => {
  const a = (await call('/farmers/me/analytics?days=30', { token: T.farmer })).data
  assert.ok(a.totals.orders >= 1); assert.ok(a.totals.revenue > 0); assert.equal(a.range.days, 30); assert.equal(a.weekdayPattern.length, 7)
  const f = (await call('/farmers/me/forecast', { token: T.farmer })).data
  assert.match(f.disclaimer, /Estimate/i); assert.ok(f.method)
  assert.ok(f.forecasts.every((x) => x.confidence === 'insufficient_data' ? x.suggestedStock === null : x.suggestedStock >= 0), 'no suggestion when data is insufficient')
  assert.equal(f.sufficientData, false, 'fresh DB history is too short to claim a prediction')
  const w = (await call('/farmers/me/waste', { token: T.farmer })).data
  assert.ok(Array.isArray(w.alerts)); assert.ok(w.analytics.definition)
  assert.equal((await call('/farmers/me/analytics', { token: T.customer })).status, 403)
})

test('forecast math: weighted moving average with accuracy back-test on synthetic history', async () => {
  const { weightedMA } = await import('../src/services/forecastMath.js')
  assert.equal(weightedMA([10, 10, 10, 10]), 10)
  assert.ok(weightedMA([20, 0, 0, 0]) > weightedMA([0, 0, 0, 20]), 'recent weeks weigh more')
})

test('waste: low-demand discount applied at checkout and counted as promotion', async () => {
  const p = (await call('/products', { method: 'POST', token: T.farmer, body: { name: `Promo ${Date.now()}`, price: 200, unit: 'kg', stock: 30, discountPercent: 25 } })).data.product
  const o = await call('/orders', { method: 'POST', token: T.customer, body: { pickupDate: futureDate(5), items: [{ productId: p._id, quantity: 2 }] } })
  assert.equal(o.status, 201); assert.equal(o.data.order.items[0].price, 150); assert.equal(o.data.order.total, 300)
  const w = (await call('/farmers/me/waste', { token: T.farmer })).data.analytics; assert.ok(w.unitsSoldOnPromotion >= 2)
  const imp = (await call('/admin/impact', { token: T.admin })).data
  assert.ok(imp.metrics.unitsSoldOnPromotion >= 2); assert.match(imp.definitions.note, /does not estimate/i)
  assert.equal((await call('/admin/impact', { token: T.customer })).status, 403)
})

test('AI assistant answers from real data; budget basket stays within budget; honest about missing AI provider', async () => {
  const r = (await call('/ai/chat', { method: 'POST', body: { message: 'vegetables under 300 rupees' } })).data
  assert.equal(r.mode, 'database'); assert.equal(r.aiConfigured, false); assert.ok(r.setupNote); assert.ok(r.basket.total <= 300 && r.basket.total > 0)
  const real = (await call('/products?limit=50')).data.items
  for (const p of r.products) { const db = real.find((x) => x._id === p.id); assert.ok(db, `unknown product ${p.name}`); assert.ok(p.stock <= db.stock); assert.equal(p.name, db.name) }
  const none = (await call('/ai/chat', { method: 'POST', body: { message: 'dragonfruit' } })).data
  assert.equal(none.products.length, 0); assert.doesNotMatch(none.reply, /dragonfruit —/)
  const m = (await call('/ai/chat', { method: 'POST', body: { message: 'nearest market', lat: 24.8138, lng: 67.03 } })).data
  assert.equal(m.markets[0].name, 'Clifton Fresh Market')
  const noloc = (await call('/ai/chat', { method: 'POST', body: { message: 'markets near me' } })).data; assert.match(noloc.reply, /location/i)
  const ro = (await call('/ai/chat', { method: 'POST', body: { message: 'sabzi', language: 'roman' } })).data; assert.ok(ro.reply.length > 0)
  assert.equal((await call('/ai/chat', { method: 'POST', body: { message: '' } })).status, 422)
  assert.equal((await call('/ai/chat', { method: 'POST', body: { message: 'x'.repeat(600) } })).status, 422)
  await call('/ai/chat', { method: 'POST', token: T.customer, body: { message: 'milk' } })
  assert.ok((await call('/ai/history', { token: T.customer })).data.messages.length >= 2)
  const fa = (await call('/ai/farmer-chat', { method: 'POST', token: T.farmer, body: { message: 'what is low on stock?' } })).data
  assert.equal(fa.mode, 'database'); assert.ok(fa.reply); assert.equal((await call('/ai/farmer-chat', { method: 'POST', token: T.customer, body: { message: 'hi' } })).status, 403)
})

test('customer insights endpoint', async () => {
  const i = (await call('/insights/me', { token: T.customer })).data; assert.ok(i.stats.orders >= 1); assert.ok(i.basis)
  assert.equal((await call('/insights/me')).status, 401)
})

test('admin: users list/paginate, self-demotion blocked, audit log written, CSV export, farmer analytics access', async () => {
  const users = (await call('/admin/users?limit=2', { token: T.admin })).data; assert.equal(users.users.length, 2); assert.ok(users.pagination.total >= 4)
  assert.equal(users.users[0].password, undefined)
  const me = (await call('/auth/me', { token: T.admin })).data.user
  assert.equal((await call(`/admin/users/${me.id}`, { method: 'PUT', token: T.admin, body: { isActive: false } })).status, 400)
  const logs = (await call('/admin/audit-logs', { token: T.admin })).data.logs; assert.ok(logs.some((l) => l.action === 'farmer.status'))
  const csv = await call('/admin/reports/orders', { token: T.admin, raw: true }); assert.equal(csv.status, 200); assert.match(csv.headers.get('content-type'), /csv/)
  assert.match(await csv.text(), /orderNumber/)
  assert.equal((await call('/admin/reports/secrets', { token: T.admin })).status, 404)
  const an = (await call('/admin/analytics?days=30', { token: T.admin })).data; assert.ok(an.totals.orders > 0); assert.ok(an.trend.length > 0); assert.ok(an.marketPerformance.length >= 3)
  assert.equal((await call('/admin/audit-logs', { token: T.farmer })).status, 403)
})

test('market analytics and sub-resources', async () => {
  const m = (await call('/markets')).data.markets[0]
  assert.ok(Array.isArray((await call(`/markets/${m._id}/farmers`)).data.farmers))
  assert.ok((await call(`/markets/${m._id}/products`)).data.pagination)
  const a = (await call(`/markets/${m._id}/analytics?days=30`)).data; assert.equal(a.range.days, 30); assert.ok(a.stats.products >= 1)
})

test('uploads: valid image accepted and served; fake image / wrong role / oversize rejected', async () => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
  const send = async (token, folder, buf, name = 'x.png') => { const fd = new FormData(); fd.append('image', new Blob([buf]), name); const r = await fetch(`${API}/uploads/images/${folder}`, { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: fd }); return { status: r.status, body: await r.json() } }
  const ok = await send(T.farmer, 'products', png); assert.equal(ok.status, 201); assert.match(ok.body.data.path, /^\/uploads\/images\/products\/[\w-]+\.png$/)
  const served = await fetch(`${API.replace('/api', '')}${ok.body.data.path}`); assert.equal(served.status, 200); assert.match(served.headers.get('content-type'), /image\/png/)
  assert.equal(served.headers.get('cross-origin-resource-policy'), 'cross-origin')
  assert.equal((await send(T.farmer, 'products', Buffer.from('<script>alert(1)</script>'), 'evil.png')).status, 422)
  assert.equal((await send(T.farmer, 'markets', png)).status, 403)
  assert.equal((await send(T.customer, 'products', png)).status, 403)
  assert.equal((await send(T.farmer, '../etc', png)).status, 404)
  assert.equal((await send(T.farmer, 'products', Buffer.concat([png, Buffer.alloc(6 * 1024 * 1024)]))).status, 413)
  assert.equal((await fetch(`${API.replace('/api', '')}/uploads/images/products/missing.jpg`)).status, 404)
  assert.equal((await fetch(`${API.replace('/api', '')}/uploads/..%2f..%2f.env`)).status === 200, false, 'no path traversal')
})

test('contact form validation + public pages API', async () => {
  assert.equal((await call('/contact', { method: 'POST', body: { name: 'A', email: 'bad', message: 'short' } })).status, 422)
  assert.equal((await call('/contact', { method: 'POST', body: { name: 'Sara', email: 'sara@example.com', message: 'Hello, I have a question.' } })).status, 201)
  assert.ok((await call('/admin/contact-messages', { token: T.admin })).data.messages.length >= 1)
})

test('profile update + language preference persists; role cannot be self-changed', async () => {
  const r = await call('/auth/profile', { method: 'PUT', token: T.customer, body: { language: 'roman', city: 'Lahore', role: 'admin' } })
  assert.equal(r.data.user.language, 'roman'); assert.equal(r.data.user.role, 'customer')
  assert.equal((await call('/auth/profile', { method: 'PUT', token: T.customer, body: { language: 'klingon' } })).status, 422)
  assert.equal((await call('/auth/me', { token: T.customer })).data.user.language, 'roman')
})

test('error handling: unknown route JSON 404, no stack traces leaked, malformed JSON handled', async () => {
  const r = await call('/nope'); assert.equal(r.status, 404); assert.equal(r.body.success, false)
  const bad = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{bad json' })
  assert.ok([400, 500].includes(bad.status)); const txt = await bad.text(); assert.doesNotMatch(txt, /node_modules|at .*\.js/)
})

test('per-farmer pickups map: each split order gets its own date/time; missing farmer pickup rejected', async () => {
  const d1 = futureDate(6), d2 = futureDate(7)
  const r = await call('/orders', { method: 'POST', token: T.customer, body: { items: [{ productId: T.tomato._id, quantity: 1 }, { productId: T.mint._id, quantity: 1 }], pickups: { [T.tomato.farmer._id]: { date: d1, time: '09:00-10:00' }, [T.mint.farmer._id]: { date: d2, time: '09:00-10:00' } } } })
  assert.equal(r.status, 201, JSON.stringify(r.body))
  const byName = Object.fromEntries(r.data.orders.map((o) => [o.items[0].name, o]))
  assert.equal(byName['Organic Tomatoes'].pickupDate, d1); assert.equal(byName['Fresh Mint'].pickupDate, d2)
  const before = (await call(`/products/${T.tomato._id}`)).data.product.stock
  const bad = await call('/orders', { method: 'POST', token: T.customer, body: { items: [{ productId: T.tomato._id, quantity: 1 }, { productId: T.mint._id, quantity: 1 }], pickups: { [T.tomato.farmer._id]: { date: d1, time: '09:00-10:00' } } } })
  assert.equal(bad.status, 422); assert.equal((await call(`/products/${T.tomato._id}`)).data.product.stock, before, 'rolled back')
})

test('reviews: edit own, my reviews, public farmer reviews, remove reply; farmerId exposed to farmer users', async () => {
  const mine = (await call('/reviews/me', { token: T.customer })).data.reviews; assert.ok(mine.length >= 1)
  const r = mine.find((x) => x.product?._id === T.tomato._id) || mine[0]
  const up = await call(`/reviews/${r._id}`, { method: 'PUT', token: T.customer, body: { rating: 3, title: 'Okay', comment: 'Fine' } })
  assert.equal(up.status, 200); assert.equal(up.data.review.rating, 3); assert.equal(up.data.review.edited, true)
  assert.equal((await call(`/reviews/${r._id}`, { method: 'PUT', token: T.farmer, body: { rating: 1 } })).status, 403)
  const pub = (await call(`/reviews/farmer/${T.tomato.farmer._id}`)).data.reviews; assert.ok(Array.isArray(pub))
  assert.equal((await call(`/reviews/${r._id}/reply`, { method: 'DELETE', token: T.farmer2 })).status, 403)
  assert.equal((await call(`/reviews/${r._id}/reply`, { method: 'DELETE', token: T.farmer })).status, 200)
  const meF = (await call('/auth/me', { token: T.farmer })).data.user; assert.equal(meF.farmerId, T.tomato.farmer._id)
})
