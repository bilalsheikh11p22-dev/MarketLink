// Rating maths. Products/farmers already carry a mock aggregate
// (rating + reviewCount, like a real API would return). We derive a
// believable 1–5★ distribution from that aggregate, then fold in any
// reviews created in this browser so submitting a review visibly moves
// the numbers.

/** Distribution counts {5,4,3,2,1} whose mean ≈ avg and sum === count. */
export function distributionFromAverage(avg, count) {
  const empty = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  if (!count) return empty
  const target = Math.min(4.98, Math.max(1.05, avg))
  const meanFor = (lambda) => {
    let num = 0
    let den = 0
    for (let k = 1; k <= 5; k++) {
      const w = Math.exp(lambda * k)
      num += k * w
      den += w
    }
    return num / den
  }
  let lo = -2
  let hi = 8
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (meanFor(mid) < target) lo = mid
    else hi = mid
  }
  const lambda = (lo + hi) / 2
  const weights = [1, 2, 3, 4, 5].map((k) => Math.exp(lambda * k))
  const total = weights.reduce((a, b) => a + b, 0)
  const raw = weights.map((w) => (w / total) * count)
  const floors = raw.map(Math.floor)
  let remainder = count - floors.reduce((a, b) => a + b, 0)
  raw
    .map((r, i) => ({ i, frac: r - floors[i] }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ i }) => {
      if (remainder > 0) {
        floors[i] += 1
        remainder -= 1
      }
    })
  return { 1: floors[0], 2: floors[1], 3: floors[2], 4: floors[3], 5: floors[4] }
}

/**
 * @param {number} baseAverage   aggregate average from the item's data
 * @param {number} baseCount     aggregate review count from the item's data
 * @param {number[]} extraRatings ratings from reviews created locally
 */
export function summarizeRatings(baseAverage, baseCount, extraRatings = []) {
  const distribution = distributionFromAverage(baseAverage, baseCount)
  extraRatings.forEach((r) => {
    if (distribution[r] !== undefined) distribution[r] += 1
  })
  const count = baseCount + extraRatings.length
  const sum = baseAverage * baseCount + extraRatings.reduce((a, b) => a + b, 0)
  const average = count ? sum / count : 0
  const percentages = {}
  for (let k = 1; k <= 5; k++) percentages[k] = count ? Math.round((distribution[k] / count) * 100) : 0
  return { average, count, distribution, percentages }
}
