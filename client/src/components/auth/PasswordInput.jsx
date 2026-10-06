import { forwardRef, useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import AuthInput from './AuthInput.jsx'

/** Password field with an accessible show/hide toggle. */
const PasswordInput = forwardRef(function PasswordInput({ label = 'Password', ...props }, ref) {
  const [visible, setVisible] = useState(false)

  return (
    <AuthInput
      ref={ref}
      label={label}
      icon={Lock}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="flex h-9 w-9 items-center justify-center text-forest-deep/50 hover:text-forest-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
        >
          {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      }
      {...props}
    />
  )
})

export default PasswordInput
