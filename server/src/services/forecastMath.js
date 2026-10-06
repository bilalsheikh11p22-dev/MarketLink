/** Weighted moving average. buckets[0] is the most recent week; weight = 1/(index+1). */
export function weightedMA(buckets) {
  let num = 0, den = 0
  buckets.forEach((q, i) => { const w = 1 / (i + 1); num += q * w; den += w })
  return den ? num / den : 0
}
