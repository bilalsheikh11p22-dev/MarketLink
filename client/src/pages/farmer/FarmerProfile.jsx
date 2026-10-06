import { useState } from 'react'
import { useFarmer } from '../../context/FarmerContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import FarmerProfileForm from '../../components/farmer/FarmerProfileForm.jsx'
import AppImage from '../../components/image/AppImage.jsx'

export default function FarmerProfile() {
  const { getFarmerProfile, updateFarmerProfile } = useFarmer()
  const { showToast } = useToast()
  const profile = getFarmerProfile()
  const [editing, setEditing] = useState(false)

  const handleSave = async (form) => {
    try { await updateFarmerProfile(form); showToast('Profile updated'); setEditing(false) }
    catch (e) { showToast(e.message || 'Could not save your profile') }
  }

  if (editing) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-3xl text-forest-deep mb-8">Edit Profile</h1>
        <FarmerProfileForm profile={profile} onSave={handleSave} onCancel={() => setEditing(false)} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-8">
        <h1 className="font-display text-3xl text-forest-deep">Profile</h1>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="px-5 py-2.5 border border-forest/20 text-forest-deep text-sm hover:border-olive/60 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      <div className="flex items-center gap-5 mb-8">
        <AppImage src={profile.avatar} alt={profile.name} kind="avatar" wrapperClassName="!h-20 !w-20 shrink-0 rounded-full border border-forest/15" />
        <div>
          <p className="font-display text-2xl text-forest-deep">{profile.name}</p>
          <p className="text-forest-deep/55 text-sm">{profile.farmName}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
        <div>
          <dt className="text-forest-deep/50 mb-1">Email</dt>
          <dd className="text-forest-deep">{profile.email}</dd>
        </div>
        <div>
          <dt className="text-forest-deep/50 mb-1">Phone</dt>
          <dd className="text-forest-deep">{profile.phone}</dd>
        </div>
        <div>
          <dt className="text-forest-deep/50 mb-1">Specialty</dt>
          <dd className="text-forest-deep">{profile.specialty}</dd>
        </div>
        <div>
          <dt className="text-forest-deep/50 mb-1">Location</dt>
          <dd className="text-forest-deep">{profile.location}</dd>
        </div>
        <div>
          <dt className="text-forest-deep/50 mb-1">Market</dt>
          <dd className="text-forest-deep">{profile.marketName}</dd>
        </div>
      </dl>

      <div className="mt-8 pt-8 border-t border-forest/10">
        <p className="text-forest-deep/50 text-sm mb-2">Bio</p>
        <p className="text-forest-deep/80 leading-relaxed">{profile.bio}</p>
      </div>
    </div>
  )
}
