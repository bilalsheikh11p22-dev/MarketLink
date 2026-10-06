// In-process async mutex per key. Serialises stock mutations for the same product inside one Node process.
// Cross-process safety still relies on MongoDB's atomic conditional update ($inc with a stock >= qty filter).
const tails = new Map()
async function acquire(key) {
  const prev = tails.get(key) || Promise.resolve()
  let release
  const next = new Promise((r) => { release = r })
  tails.set(key, prev.then(() => next))
  await prev
  return () => { release(); if (tails.get(key) === undefined) return }
}
export async function withLocks(keys, fn) {
  const sorted = [...new Set(keys.map(String))].sort() // fixed order prevents deadlocks
  const releases = []
  try {
    for (const k of sorted) releases.push(await acquire(k))
    return await fn()
  } finally {
    releases.reverse().forEach((r) => r())
  }
}
