import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, AlertCircle, Loader2, Lock, CheckCircle } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'
import { ensureDemoUser, loginUser } from '../../lib/mockAuth'
import { DEMO_PASSWORD } from '../../lib/demoAccount'
import { studentProfile } from '../../data/student'

type LoginState = 'idle' | 'loading' | 'invalid' | 'unverified' | 'locked' | 'success' | 'expired'

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [email, setEmail] = useState(studentProfile.email)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [state, setState] = useState<LoginState>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('loading')

    // Demo-only shortcuts to preview other UI states without touching real accounts.
    if (email === 'locked@student.edu.vn') { setTimeout(() => setState('locked'), 1200); return }
    if (email === 'unverified@student.edu.vn') { setTimeout(() => setState('unverified'), 1200); return }

    const normalized = email.trim().toLowerCase()
    // Seed the built-in demo account on first use so it's always available.
    if (normalized === studentProfile.email.toLowerCase()) {
      await ensureDemoUser(studentProfile.email, studentProfile.fullName, DEMO_PASSWORD)
    }

    // Real credential + MFA check against the mock account store - covers both
    // the seeded demo account and any account created via the register page.
    const result = await loginUser(email, password)
    setTimeout(() => {
      if (!result.ok) {
        if (result.reason === 'locked') return setState('locked')
        return setState('invalid')
      }
      setState('success')
      setTimeout(() => navigate(result.mfaRequired ? '/two-factor' : '/dashboard', { state: { email: normalized } }), 800)
    }, 1200)
  }

  const alertConfig: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
    invalid: { text: t('login_err_invalid'), color: 'bg-red-50 border-red-200 text-red-700', icon: <AlertCircle size={16} className="text-red-500 flex-shrink-0" /> },
    unverified: { text: t('login_err_unverified'), color: 'bg-amber-50 border-amber-200 text-amber-700', icon: <AlertCircle size={16} className="text-amber-500 flex-shrink-0" /> },
    locked: { text: t('login_err_locked'), color: 'bg-red-50 border-red-200 text-red-700', icon: <Lock size={16} className="text-red-500 flex-shrink-0" /> },
    success: { text: t('login_err_success'), color: 'bg-green-50 border-green-200 text-green-700', icon: <CheckCircle size={16} className="text-green-500 flex-shrink-0" /> },
  }

  const alert = alertConfig[state]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-blue-50/30 to-[#EFF6FF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#063B00] rounded-[20px] mb-4 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div className="text-2xl font-bold text-[#1B5E20]">UTH Portal</div>
          <div className="text-sm text-gray-500 mt-0.5">{t('brand_subtitle')}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          <h1 className="text-xl font-bold text-gray-900 mb-1">{t('login_heading')}</h1>
          <p className="text-sm text-gray-500 mb-6">{t('login_subheading')}</p>

          {alert && (
            <div className={`flex items-start gap-2.5 p-3 rounded-lg border text-sm mb-5 ${alert.color}`}>
              {alert.icon}
              <span>{alert.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('login_id_label')}</label>
              <input
                type="text"
                value={email}
                onChange={e => { setEmail(e.target.value); setState('idle') }}
                placeholder={t('login_id_placeholder')}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                  state === 'invalid' || state === 'locked'
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-[#2563EB]/30 focus:border-[#2563EB]'
                }`}
                disabled={state === 'loading' || state === 'success'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('login_password_label')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setState('idle') }}
                  placeholder={t('login_password_placeholder')}
                  className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                    state === 'invalid'
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-[#2563EB]/30 focus:border-[#2563EB]'
                  }`}
                  disabled={state === 'loading' || state === 'success'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#2563EB]" />
                <span className="text-sm text-gray-600">{t('login_remember')}</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-[#2563EB] hover:text-[#1E3A8A] font-medium">{t('login_forgot')}</Link>
            </div>

            <button
              type="submit"
              disabled={state === 'loading' || state === 'success' || state === 'locked'}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {state === 'loading' ? <><Loader2 size={16} className="animate-spin" /> {t('login_btn_loading')}</> :
               state === 'success' ? <><CheckCircle size={16} /> {t('login_btn_success')}</> :
               t('login_btn')}
            </button>
          </form>

          <div className="text-center mt-5 text-sm text-gray-600">
            {t('login_no_account')}{' '}
            <Link to="/register" className="text-[#2563EB] hover:text-[#1E3A8A] font-medium">{t('login_create')}</Link>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield size={13} className="text-[#16A34A]" />
          <span>{t('login_mfa_notice')}</span>
        </div>
        <div className="mt-2 text-center text-xs text-gray-400">
          Demo: {studentProfile.email} / {DEMO_PASSWORD} (bật MFA trong Cài đặt → Bảo mật)
        </div>
      </div>
    </div>
  )
}
