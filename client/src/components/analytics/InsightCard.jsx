export default function InsightCard({ text, tone = 'neutral' }) {
  const styles = {
    neutral: 'border-forest/10 bg-forest/5',
    positive: 'border-sage/20 bg-sage/10',
    warning: 'border-olive/25 bg-olive/10'
  }
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm text-forest/80 ${styles[tone] || styles.neutral}`}>
      {text}
    </div>
  )
}
