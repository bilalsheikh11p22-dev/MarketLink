import { useAdmin } from '../../context/AdminContext.jsx'
export default function Settings() {
  const { settings, saveSettings, resetAdminData } = useAdmin()
  const toggle = (section, key) => {
    saveSettings({
      ...settings,
      [section]: { ...settings[section], [key]: !settings[section][key] }
    })
  }
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="font-display text-2xl text-forest-deep">Settings</h1>
      <p className="text-sm text-forest/55">These are display preferences saved in this browser only.</p>
      <div className="rounded-2xl border border-forest/8 bg-cream-soft p-6 space-y-4">
        <h2 className="font-display text-lg">Appearance</h2>
        <div className="flex gap-3">
          {['light', 'dark'].map((m) => (
            <button key={m} type="button" onClick={() => saveSettings({ ...settings, appearance: m })} className={`rounded-xl px-4 py-2 text-sm capitalize ${settings.appearance === m ? 'bg-forest text-cream' : 'border border-forest/15 text-forest'}`}>{m} mode</button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-forest/8 bg-cream-soft p-6 space-y-3">
        <h2 className="font-display text-lg">Notifications</h2>
        {Object.entries(settings.notifications || {}).map(([k, v]) => (
          <label key={k} className="flex items-center justify-between text-sm">
            <span className="capitalize text-forest/80">{k.replace(/([A-Z])/g, ' $1')}</span>
            <input type="checkbox" checked={!!v} onChange={() => toggle('notifications', k)} className="h-4 w-4 accent-forest" />
          </label>
        ))}
      </div>
      <button type="button" onClick={resetAdminData} className="text-sm text-red-700 hover:underline">Reset display preferences</button>
    </div>
  )
}
