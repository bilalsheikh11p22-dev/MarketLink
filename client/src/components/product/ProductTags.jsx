export default function ProductTags({ tags = [] }) {
  if (!tags.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="px-3 py-1 text-xs border border-forest/15 text-forest-deep/70">
          {tag}
        </span>
      ))}
    </div>
  )
}
