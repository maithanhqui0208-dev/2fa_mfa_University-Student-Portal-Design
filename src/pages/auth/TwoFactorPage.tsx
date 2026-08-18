import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Shield, Smartphone, AlertCircle, CheckCircle, Loader2, Clock, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'
import { verifyMfaCode } from '../../lib/mockAuth'
import { studentProfile } from '../../data/student'
import { secondsRemaining } from '../../lib/totp'

type State = 'idle' | 'loading' | 'invalid' | 'expired' | 'locked' | 'success'

export default function TwoFactorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const email = (location.state as { email?: string } | null)?.email ?? studentProfile.email
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [state, setState] = useState<State>('idle')
  const [trust, setTrust] = useState(false)
  const [progress, setProgress] = useState(100)
  const [lockSecondsLeft, setLockSecondsLeft] = useState(0)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((secondsRemaining() / 30) * 100)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (state !== 'locked' || lockSecondsLeft <= 0) return
    const id = setInterval(() => {
      setLockSecondsLeft(s => {
        if (s <= 1) { setState('idle'); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [state, lockSecondsLeft])

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[i] = val.slice(-1)
    setOtp(next); setState('idle')
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) { setOtp(text.split('')); refs.current[5]?.focus() }
    e.preventDefault()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) return
    setState('loading')
    const result = await verifyMfaCode(email, code)
    if (!result.ok) {
      if (result.reason === 'locked') {
        setLockSecondsLeft(Math.ceil((result.retryAfterMs ?? 0) / 1000))
        setState('locked')
      } else {
        setState('invalid')
      }
      setOtp(['', '', '', '', '', ''])
      refs.current[0]?.focus()
      return
    }
    setState('success')
    setTimeout(() => navigate('/dashboard'), 900)
  }

  const otpError = state === 'invalid' || state === 'expired' || state === 'locked'

  const alerts: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
    invalid: { text: t('tfa_err_invalid'), color: 'bg-red-50 border-red-200 text-red-700', icon: <AlertCircle size={14} className="text-red-500" /> },
    expired: { text: t('tfa_err_expired'), color: 'bg-amber-50 border-amber-200 text-amber-700', icon: <Clock size={14} className="text-amber-500" /> },
    locked: { text: `${t('tfa_err_locked')} (${lockSecondsLeft}s)`, color: 'bg-red-50 border-red-200 text-red-700', icon: <AlertCircle size={14} className="text-red-500" /> },
    success: { text: t('tfa_err_success'), color: 'bg-green-50 border-green-200 text-green-700', icon: <CheckCircle size={14} className="text-green-500" /> },
  }

  const alert = alerts[state]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-blue-50/30 to-[#EFF6FF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1E3A8A] rounded-2xl mb-3 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="text-xl font-bold text-[#1E3A8A]">{t('brand_name')}</div>
          <div className="text-xs text-gray-500">{t('tfa_subtitle')}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <div className="text-center mb-6">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-[#2563EB]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#16A34A] rounded-full flex items-center justify-center">
                <Shield size={12} className="text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{t('tfa_title')}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('tfa_instruction')}{' '}
              <span className="font-medium text-gray-700">{t('tfa_authenticator')}</span>{' '}
              {t('tfa_app_suffix')}
            </p>
          </div>

          {alert && (
            <div className={`flex items-start gap-2.5 p-3 rounded-lg border text-sm mb-5 ${alert.color}`}>
              {alert.icon}<span className="flex-1">{alert.text}</span>
            </div>
          )}

          {/* TOTP validity bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span className="flex items-center gap-1"><Clock size={11} /> {t('tfa_validity')}</span>
              <span className={progress < 33 ? 'text-red-500 font-semibold' : 'text-gray-500'}>
                {`${Math.round(progress * 30 / 100)}${t('tfa_remaining')}`}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${progress > 66 ? 'bg-[#16A34A]' : progress > 33 ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-center mb-5" onPaste={handlePaste}>
            {otp.map((d, i) => (
              <input key={i} ref={el => { refs.current[i] = el }} type="text" inputMode="numeric" maxLength={1} value={d}
                onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
                className={`otp-input ${d ? 'filled' : ''} ${otpError ? 'error' : ''}`}
                disabled={state === 'loading' || state === 'success' || state === 'locked'} />
            ))}
          </div>

          <label className="flex items-center gap-2.5 mb-5 cursor-pointer">
            <input type="checkbox" checked={trust} onChange={e => setTrust(e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#2563EB]" />
            <span className="text-sm text-gray-600">{t('tfa_trust')}</span>
          </label>

          <button
            onClick={handleVerify}
            disabled={otp.join('').length < 6 || state === 'loading' || state === 'success' || state === 'locked'}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors mb-4"
          >
            {state === 'loading' ? <><Loader2 size={16} className="animate-spin" /> {t('tfa_btn_loading')}</> :
             state === 'success' ? <><CheckCircle size={16} /> {t('tfa_btn_success')}</> : t('tfa_btn')}
          </button>

          <div className="space-y-2 text-center">
            <Link to="/recovery" state={{ email }} className="block text-sm text-[#2563EB] hover:text-[#1E3A8A]">{t('tfa_recovery_link')}</Link>
            <Link to="/recovery" state={{ email }} className="block text-sm text-gray-500 hover:text-gray-700">{t('tfa_no_access')}</Link>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1.5">
            <ArrowLeft size={14} /> {t('tfa_back')}
          </Link>
        </div>
      </div>
    </div>
  )
}
