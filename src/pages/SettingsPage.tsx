import { useState, useRef } from 'react'
import {
  Shield, Smartphone, Eye, EyeOff, CheckCircle, AlertTriangle, Copy,
  Download, Key, RefreshCw, X, Loader2, Monitor, LogOut,
  MapPin, ChevronRight, Moon, Sun, Bell, User, Lock, Laptop
} from 'lucide-react'
import { useToast } from '../components/Toast'
import { useLanguage } from '../i18n/LanguageContext'
import { studentProfile } from '../data/student'
import QRCodeSVG from '../components/QRCode'

// ─── OTP input ────────────────────────────────────────────────────────────────
function OTPInputs({ value, onChange, error }: { value: string[]; onChange: (v: string[]) => void; error?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const hc = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return
    const n = [...value]; n[i] = v.slice(-1); onChange(n)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }
  const hk = (i: number, e: React.KeyboardEvent) => { if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus() }
  const hp = (e: React.ClipboardEvent) => {
    const tt = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (tt.length === 6) { onChange(tt.split('')); refs.current[5]?.focus() }
    e.preventDefault()
  }
  return (
    <div className="flex gap-2 justify-center" onPaste={hp}>
      {value.map((d, i) => (
        <input key={i} ref={el => { refs.current[i] = el }} type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => hc(i, e.target.value)} onKeyDown={e => hk(i, e)}
          className={`otp-input ${d ? 'filled' : ''} ${error ? 'error' : ''}`} />
      ))}
    </div>
  )
}

// ─── Recovery codes ────────────────────────────────────────────────────────────
const RECOVERY_CODES = [
  'A3F2-8KX1-P9QR', 'B7HN-2MWT-6VYZ', 'C1DJ-5LSU-0EGI',
  'D4GP-9NXV-3AHJ', 'E6IQ-1OYW-7BKL', 'F8KR-4PZX-2CMN',
  'G0MS-7QAY-5DOP', 'H2NT-3RBZ-8EFQ',
]

// ─── Sessions ─────────────────────────────────────────────────────────────────
const sessions = [
  { id: 1, device: 'MacBook Pro', browser: 'Chrome 126', os: 'macOS 14', ip: '203.xxx.xxx.12', location: 'TP. Hồ Chí Minh, VN', lastActive: 'Ngay bây giờ', current: true, trusted: true },
  { id: 2, device: 'iPhone 15', browser: 'Safari 17', os: 'iOS 17', ip: '203.xxx.xxx.14', location: 'TP. Hồ Chí Minh, VN', lastActive: '2 giờ trước', current: false, trusted: true },
  { id: 3, device: 'Windows PC', browser: 'Edge 125', os: 'Windows 11', ip: '171.xxx.xxx.88', location: 'Hà Nội, VN', lastActive: '3 ngày trước', current: false, trusted: false },
]

// ─── 2FA Setup Wizard ─────────────────────────────────────────────────────────
function Setup2FAModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { t } = useLanguage()
  const [step, setStep] = useState(1)
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [codesChecked, setCodesChecked] = useState(false)
  const { toast } = useToast()

  const SECRET = 'JBSWY3DPEHPK3PXP'

  const next = (fn: () => void) => { setLoading(true); setTimeout(() => { setLoading(false); fn() }, 900) }

  const step1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 6) { setPwdError(t('setup_s1_err')); return }
    next(() => { setPwdError(''); setStep(2) })
  }

  const step3Submit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code === '111111') { setOtpError(true); return }
    next(() => { setOtpError(false); setStep(4) })
  }

  const copySecret = () => {
    navigator.clipboard.writeText(SECRET).catch(() => {})
    setCopied(true)
    toast('success', t('toast_secret_title'), t('toast_secret_msg'))
    setTimeout(() => setCopied(false), 2000)
  }

  const copyCodes = () => {
    navigator.clipboard.writeText(RECOVERY_CODES.join('\n')).catch(() => {})
    toast('success', t('toast_codes_title'), t('toast_codes_msg'))
  }

  const stepLabels = [t('setup_step1'), t('setup_step2'), t('setup_step3'), t('setup_step4')]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{t('setup_title')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>

        {/* Stepper */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i + 1 < step ? 'bg-[#16A34A] text-white' :
                    i + 1 === step ? 'bg-[#2563EB] text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {i + 1 < step ? <CheckCircle size={13} /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1 text-center leading-tight max-w-16 ${i + 1 === step ? 'text-[#2563EB] font-medium' : 'text-gray-400'}`}>{label}</span>
                </div>
                {i < 3 && <div className={`flex-1 h-px mx-1 mb-4 ${i + 1 < step ? 'bg-[#16A34A]' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 pt-2">
          {/* Step 1: Confirm password */}
          {step === 1 && (
            <form onSubmit={step1Submit} className="space-y-4">
              <p className="text-sm text-gray-500">{t('setup_s1_note')}</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('setup_s1_label')}</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setPwdError('') }} placeholder={t('setup_s1_placeholder')} className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] ${pwdError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
                {pwdError && <p className="text-xs text-red-600 mt-1">{pwdError}</p>}
                <p className="text-xs text-gray-400 mt-1">{t('setup_s1_hint')}</p>
              </div>
              <button type="submit" disabled={!password || loading} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={15} className="animate-spin" /> {t('setup_s1_verifying')}</> : t('setup_s1_btn')}
              </button>
            </form>
          )}

          {/* Step 2: QR code */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-sm text-gray-500 space-y-1">
                <p>{t('setup_s2_step1')} <strong>Google Authenticator</strong> {t('setup_s2_from')}</p>
                <p>{t('setup_s2_step2')} <strong>+</strong> → <strong>{t('setup_s2_scan')}</strong> {t('setup_s2_scan_suffix')}</p>
              </div>

              {/* QR code — unchanged */}
              <div className="flex flex-col items-center" translate="no">
                <QRCodeSVG size={176} />
                <p className="text-xs text-gray-400 mt-2">{t('setup_s2_issuer')}</p>
              </div>

              {/* Manual key */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-2">{t('setup_s2_manual')}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm text-gray-800 tracking-widest">{SECRET}</code>
                  <button onClick={copySecret} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${copied ? 'bg-green-100 text-green-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {copied ? <><CheckCircle size={12} /> {t('copied')}</> : <><Copy size={12} /> {t('copy')}</>}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span><strong>{t('setup_s2_warning')}</strong> {t('setup_s2_warning_suffix')}</span>
              </div>

              <button onClick={() => setStep(3)} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-2.5 rounded-lg">
                {t('setup_s2_scanned')}
              </button>
            </div>
          )}

          {/* Step 3: Verify */}
          {step === 3 && (
            <form onSubmit={step3Submit} className="space-y-5">
              <p className="text-sm text-gray-500">{t('setup_s3_note')}</p>
              {otpError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertTriangle size={14} className="text-red-500" /> {t('setup_s3_err')}
                </div>
              )}
              <OTPInputs value={otp} onChange={v => { setOtp(v); setOtpError(false) }} error={otpError} />
              <p className="text-xs text-gray-400 text-center">{t('setup_s3_demo')} <code className="bg-gray-100 px-1 rounded">111111</code>{t('setup_s3_demo_suffix')}</p>
              <button type="submit" disabled={otp.join('').length < 6 || loading} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={15} className="animate-spin" /> {t('setup_s3_verifying')}</> : t('setup_s3_btn')}
              </button>
            </form>
          )}

          {/* Step 4: Recovery codes */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                {t('setup_s4_warning')}
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-xl p-4">
                {RECOVERY_CODES.map(c => (
                  <code key={c} className="font-mono text-xs text-gray-800 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-center">{c}</code>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={copyCodes} className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50">
                  <Copy size={14} /> {t('setup_s4_copy')}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50">
                  <Download size={14} /> {t('download')}
                </button>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={codesChecked} onChange={e => setCodesChecked(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-[#2563EB]" />
                <span className="text-sm text-gray-600">{t('setup_s4_checkbox')}</span>
              </label>

              <button
                disabled={!codesChecked}
                onClick={() => {
                  onSuccess()
                  onClose()
                  toast('success', t('toast_2fa_enabled_title'), t('toast_2fa_enabled_msg'))
                }}
                className="w-full bg-[#16A34A] hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} /> {t('setup_s4_btn')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Disable 2FA Modal ─────────────────────────────────────────────────────────
function Disable2FAModal({ onClose, onDisable }: { onClose: () => void; onDisable: () => void }) {
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [totp, setTotp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || totp.join('').length < 6) { setErr(t('disable_err')); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); onDisable(); onClose() }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{t('disable_title')}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{t('disable_subtitle')}</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-xs text-red-700">
          {t('disable_warning')}
        </div>

        {err && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">{err}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('disable_pwd_label')}</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t('disable_pwd_placeholder')} className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>{showPwd ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('disable_totp_label')}</label>
            <OTPInputs value={totp} onChange={setTotp} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50">{t('cancel')}</button>
            <button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" /> {t('disable_btn_loading')}</> : t('disable_btn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Settings page ────────────────────────────────────────────────────────
type Tab = 'personal' | 'password' | 'security' | 'sessions' | 'notifications' | 'appearance'

export default function SettingsPage() {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [tab, setTab] = useState<Tab>('security')
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [showDisable, setShowDisable] = useState(false)
  const [showCodes, setShowCodes] = useState(false)
  const [codesVisible, setCodesVisible] = useState(false)
  const [activeSessions, setActiveSessions] = useState(sessions)
  const [darkMode, setDarkMode] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({ email: true, academic: true, security: true, exam: true, tuition: false, event: false })

  // Password form
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [showPwds, setShowPwds] = useState({ current: false, next: false, confirm: false })
  const [pwdSuccess, setPwdSuccess] = useState(false)

  const tabs: { id: Tab; labelKey: string; icon: React.ReactNode }[] = [
    { id: 'personal', labelKey: t('settings_tab_personal'), icon: <User size={15} /> },
    { id: 'password', labelKey: t('settings_tab_password'), icon: <Lock size={15} /> },
    { id: 'security', labelKey: t('settings_tab_security'), icon: <Shield size={15} /> },
    { id: 'sessions', labelKey: t('settings_tab_sessions'), icon: <Laptop size={15} /> },
    { id: 'notifications', labelKey: t('settings_tab_notifications'), icon: <Bell size={15} /> },
    { id: 'appearance', labelKey: t('settings_tab_appearance'), icon: <Sun size={15} /> },
  ]

  const signOutSession = (id: number) => {
    setActiveSessions(s => s.filter(x => x.id === 1 || x.id !== id))
    toast('info', t('toast_session_title'), t('toast_session_msg'))
  }
  const signOutAll = () => {
    setActiveSessions(s => s.filter(x => x.current))
    toast('info', t('toast_sessions_all_title'), t('toast_sessions_all_msg'))
  }

  const notifLabels: Record<string, string> = {
    email: t('settings_notif_email'),
    academic: t('settings_notif_academic'),
    security: t('settings_notif_security'),
    exam: t('settings_notif_exam'),
    tuition: t('settings_notif_tuition'),
    event: t('settings_notif_event'),
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{t('settings_title')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('settings_subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar tabs */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-0.5">
            {tabs.map(tt => (
              <button
                key={tt.id}
                onClick={() => setTab(tt.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${tab === tt.id ? 'bg-[#1E3A8A] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {tt.icon} {tt.labelKey}
                {tt.id === 'security' && !mfaEnabled && <span className="ml-auto w-2 h-2 bg-amber-400 rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Security tab */}
          {tab === 'security' && (
            <>
              {/* 2FA card */}
              <div className={`bg-white rounded-2xl border shadow-sm p-6 ${mfaEnabled ? 'border-green-200' : 'border-amber-200'}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${mfaEnabled ? 'bg-green-100' : 'bg-amber-100'}`}>
                      <Smartphone size={20} className={mfaEnabled ? 'text-green-600' : 'text-amber-600'} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('settings_security_title')}</h3>
                      <p className="text-xs text-gray-500">{t('settings_security_subtitle')}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${mfaEnabled ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {mfaEnabled ? t('settings_security_enabled') : t('settings_security_not_enabled')}
                  </span>
                </div>

                {!mfaEnabled ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {[
                        { icon: <Shield size={14} />, text: t('settings_security_benefit1') },
                        { icon: <Smartphone size={14} />, text: t('settings_security_benefit2') },
                        { icon: <Key size={14} />, text: t('settings_security_benefit3') },
                      ].map(({ icon, text }) => (
                        <div key={text} className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 text-blue-700">
                          {icon} <span>{text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                      <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      {t('settings_security_save_warning')}
                    </div>
                    <button onClick={() => setShowSetup(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl transition-colors">
                      <Smartphone size={15} /> {t('settings_security_setup_btn')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={15} className="text-green-500" />
                      {t('settings_security_activated')} {t('settings_security_activated_date')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setShowSetup(true)} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50">
                        <RefreshCw size={14} /> {t('settings_security_reconfigure')}
                      </button>
                      <button onClick={() => setShowCodes(true)} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50">
                        <Key size={14} /> {t('settings_security_view_codes')}
                      </button>
                      <button onClick={() => setShowDisable(true)} className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50">
                        <X size={14} /> {t('settings_security_disable')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Account activity */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3">{t('settings_security_events')}</h3>
                <div className="space-y-3">
                  {[
                    { text: t('settings_security_ev1'), time: t('settings_security_ev1_t'), ok: true },
                    { text: t('settings_security_ev2'), time: t('settings_security_ev2_t'), ok: true },
                    { text: t('settings_security_ev3'), time: t('settings_security_ev3_t'), ok: false },
                  ].map(({ text, time, ok }) => (
                    <div key={text} className="flex items-center gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ok ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="flex-1 text-gray-700">{text}</span>
                      <span className="text-xs text-gray-400">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Password tab */}
          {tab === 'password' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('settings_pwd_title')}</h3>
              {pwdSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 mb-4">
                  <CheckCircle size={14} className="text-green-500" /> {t('settings_pwd_success')}
                </div>
              )}
              <form onSubmit={e => {
                e.preventDefault()
                setPwdSuccess(true)
                setPwd({ current: '', next: '', confirm: '' })
                toast('success', t('toast_pwd_title'), t('toast_pwd_msg'))
                setTimeout(() => setPwdSuccess(false), 3000)
              }} className="space-y-4 max-w-md">
                {(['current', 'next', 'confirm'] as const).map(k => (
                  <div key={k}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {k === 'current' ? t('settings_pwd_current') : k === 'next' ? t('settings_pwd_new') : t('settings_pwd_confirm')}
                    </label>
                    <div className="relative">
                      <input type={showPwds[k] ? 'text' : 'password'} value={pwd[k]} onChange={e => setPwd(p => ({ ...p, [k]: e.target.value }))} className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" />
                      <button type="button" onClick={() => setShowPwds(s => ({ ...s, [k]: !s[k] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
                        {showPwds[k] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
                <button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">{t('settings_pwd_btn')}</button>
              </form>
            </div>
          )}

          {/* Sessions tab */}
          {tab === 'sessions' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">{t('settings_sessions_title')}</h3>
                <button onClick={signOutAll} className="text-sm text-red-600 hover:text-red-700 font-medium">{t('settings_sessions_signout_all')}</button>
              </div>
              <div className="divide-y divide-gray-50">
                {activeSessions.map(s => (
                  <div key={s.id} className="flex items-start gap-4 px-5 py-4">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {s.device.includes('iPhone') ? <Smartphone size={16} className="text-gray-500" /> : <Monitor size={16} className="text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-semibold text-sm text-gray-800">{s.device}</span>
                        {s.current && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">{t('settings_sessions_current')}</span>}
                        {s.trusted && !s.current && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">{t('settings_sessions_trusted')}</span>}
                      </div>
                      <div className="text-xs text-gray-500">{s.browser} · {s.os}</div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><MapPin size={10} /> {s.location}</span>
                        <span>IP: {s.ip}</span>
                        <span>{t('settings_sessions_active')} {s.lastActive}</span>
                      </div>
                    </div>
                    {!s.current && (
                      <button onClick={() => signOutSession(s.id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium flex-shrink-0">
                        <LogOut size={12} /> {t('settings_sessions_signout')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications tab */}
          {tab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">{t('settings_notif_title')}</h3>
              {Object.keys(notifPrefs).map(k => (
                <div key={k} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{notifLabels[k]}</span>
                  <button
                    onClick={() => setNotifPrefs(p => ({ ...p, [k]: !p[k as keyof typeof p] }))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${notifPrefs[k as keyof typeof notifPrefs] ? 'bg-[#2563EB]' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifPrefs[k as keyof typeof notifPrefs] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Appearance tab */}
          {tab === 'appearance' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4">{t('settings_appear_title')}</h3>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <div>
                  <div className="text-sm font-medium text-gray-800">{t('settings_appear_dark')}</div>
                  <div className="text-xs text-gray-400">{t('settings_appear_dark_sub')}</div>
                </div>
                <button onClick={() => setDarkMode(!darkMode)} className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-[#1E3A8A]' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center gap-4 mt-4">
                {[{ label: t('settings_appear_light'), icon: <Sun size={20} /> }, { label: t('settings_appear_dark_mode'), icon: <Moon size={20} /> }].map(({ label, icon }, i) => (
                  <button key={label} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 flex-1 transition-colors ${(i === 0 ? !darkMode : darkMode) ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    {icon}
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Personal info tab */}
          {tab === 'personal' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-1">{t('settings_personal_title')}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {t('settings_personal_note')} <button onClick={() => {}} className="text-[#2563EB] hover:underline">{t('settings_personal_profile_link')}</button> {t('settings_personal_page_suffix')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  [t('profile_full_name'), studentProfile.fullName],
                  [t('profile_student_id'), studentProfile.studentId],
                  [t('profile_email'), studentProfile.email],
                  [t('profile_phone'), studentProfile.phone],
                  [t('profile_faculty'), studentProfile.faculty],
                  [t('profile_major'), studentProfile.major],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs text-gray-400 mb-0.5">{k}</div>
                    <div className="font-medium text-gray-800">{v}</div>
                  </div>
                ))}
              </div>
              <button className="mt-5 flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50">
                <ChevronRight size={14} /> {t('settings_personal_edit')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSetup && <Setup2FAModal onClose={() => setShowSetup(false)} onSuccess={() => setMfaEnabled(true)} />}
      {showDisable && <Disable2FAModal onClose={() => setShowDisable(false)} onDisable={() => { setMfaEnabled(false); toast('warning', t('toast_2fa_disabled_title'), t('toast_2fa_disabled_msg')) }} />}

      {/* Recovery codes modal */}
      {showCodes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowCodes(false); setCodesVisible(false) }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{t('codes_title')}</h3>
              <button onClick={() => { setShowCodes(false); setCodesVisible(false) }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={15} /></button>
            </div>
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-4">
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5 text-amber-500" />
              {t('codes_warning')}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 relative">
              {!codesVisible && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 rounded-xl">
                  <button onClick={() => setCodesVisible(true)} className="flex items-center gap-2 text-sm font-medium text-[#2563EB] hover:text-[#1E3A8A]">
                    <Eye size={15} /> {t('codes_show')}
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {RECOVERY_CODES.map(c => (
                  <code key={c} className={`font-mono text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-center ${!codesVisible ? 'text-gray-50 select-none' : 'text-gray-800'}`}>{c}</code>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-4">8 {t('codes_remaining')}</div>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(RECOVERY_CODES.join('\n')).catch(() => {}); toast('success', t('toast_codes_title'), t('toast_codes_msg')) }} className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-xl hover:bg-gray-50"><Copy size={13} /> {t('copy')}</button>
              <button className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-xl hover:bg-gray-50"><Download size={13} /> {t('download')}</button>
              <button onClick={() => toast('warning', t('toast_codes_regen_title'), t('toast_codes_regen_msg'))} className="flex-1 flex items-center justify-center gap-1.5 border border-amber-200 text-amber-600 text-sm font-medium py-2 rounded-xl hover:bg-amber-50"><RefreshCw size={13} /> {t('codes_regenerate')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
