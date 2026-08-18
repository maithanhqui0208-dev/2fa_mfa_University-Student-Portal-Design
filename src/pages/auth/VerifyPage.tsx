import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, CheckCircle, AlertCircle, Loader2, RefreshCw, Shield } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

type State = 'idle' | 'loading' | 'error' | 'expired' | 'success' | 'too_many'

export default function VerifyPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [state, setState] = useState<State>('idle')
  const [timer, setTimer] = useState(120)
  const [canResend, setCanResend] = useState(false)
  const [resent, setResent] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return }
    const id = setTimeout(() => setTimer(ti => ti - 1), 1000)
    return () => clearTimeout(id)
  }, [timer])

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[i] = val.slice(-1)
    setOtp(next); setState('idle')
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) { setOtp(text.split('')); inputRefs.current[5]?.focus() }
    e.preventDefault()
  }

  const handleVerify = () => {
    const code = otp.join('')
    if (code.length < 6) return
    setState('loading')
    setTimeout(() => {
      if (code === '000000') return setState('too_many')
      if (code === '999999') return setState('expired')
      if (code === '123456') return setState('success')
      setState('error')
    }, 1200)
  }

  const handleResend = () => {
    setTimer(120); setCanResend(false); setResent(true)
    setOtp(['', '', '', '', '', '']); setState('idle')
    inputRefs.current[0]?.focus()
    setTimeout(() => setResent(false), 3000)
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-blue-50/30 to-[#EFF6FF] flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-[#16A34A]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('verify_success_title')}</h1>
          <p className="text-gray-500 mb-8">{t('verify_success_body')}</p>
          <button onClick={() => navigate('/login')} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-3 rounded-xl transition-colors">
            {t('verify_success_btn')}
          </button>
        </div>
      </div>
    )
  }

  const alertConfig = {
    error: { text: t('verify_err_wrong'), color: 'bg-red-50 border-red-200 text-red-700', icon: <AlertCircle size={15} className="text-red-500" /> },
    expired: { text: t('verify_err_expired'), color: 'bg-amber-50 border-amber-200 text-amber-700', icon: <AlertCircle size={15} className="text-amber-500" /> },
    too_many: { text: t('verify_err_too_many'), color: 'bg-red-50 border-red-200 text-red-700', icon: <AlertCircle size={15} className="text-red-500" /> },
  }

  const alert = alertConfig[state as keyof typeof alertConfig]
  const otpError = state === 'error' || state === 'expired' || state === 'too_many'
  const mins = String(Math.floor(timer / 60)).padStart(2, '0')
  const secs = String(timer % 60).padStart(2, '0')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-blue-50/30 to-[#EFF6FF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1E3A8A] rounded-2xl mb-3 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="text-xl font-bold text-[#1E3A8A]">{t('brand_name')}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#2563EB]" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{t('verify_heading')}</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('verify_subheading')}{' '}
              <span className="font-medium text-gray-700">ng***@student.edu.vn</span>
              {t('verify_instruction')}
            </p>
          </div>

          {alert && (
            <div className={`flex items-start gap-2.5 p-3 rounded-lg border text-sm mb-5 ${alert.color}`}>
              {alert.icon}<span>{alert.text}</span>
            </div>
          )}

          {resent && (
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-green-50 border-green-200 text-green-700 text-sm mb-5">
              <CheckCircle size={15} className="text-green-500" /><span>{t('verify_resent')}</span>
            </div>
          )}

          <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`otp-input ${digit ? 'filled' : ''} ${otpError ? 'error' : ''}`}
              />
            ))}
          </div>

          <div className="text-center mb-5">
            {!canResend ? (
              <p className="text-sm text-gray-500">
                {t('verify_expires')}{' '}
                <span className={`font-mono font-semibold ${timer <= 30 ? 'text-red-500' : 'text-[#2563EB]'}`}>{mins}:{secs}</span>
              </p>
            ) : (
              <p className="text-sm text-red-500 font-medium">{t('verify_expired_msg')}</p>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={otp.join('').length < 6 || state === 'loading' || state === 'too_many'}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
          >
            {state === 'loading' ? <><Loader2 size={16} className="animate-spin" /> {t('verify_btn_loading')}</> : t('verify_btn')}
          </button>

          <div className="flex items-center justify-center gap-4 text-sm">
            <button onClick={handleResend} disabled={!canResend}
              className="flex items-center gap-1.5 text-[#2563EB] hover:text-[#1E3A8A] disabled:text-gray-400 disabled:cursor-not-allowed font-medium">
              <RefreshCw size={13} /> {t('verify_resend')}
            </button>
            <span className="text-gray-300">|</span>
            <Link to="/register" className="text-gray-500 hover:text-gray-700">{t('verify_change_email')}</Link>
          </div>
        </div>

        <p className="text-center mt-4 text-xs text-gray-500">
          {t('verify_demo')} <span className="font-mono bg-gray-100 px-1 rounded">123456</span> {t('verify_demo_verify')}{' '}
          <span className="font-mono bg-gray-100 px-1 rounded">999999</span> {t('verify_demo_expired')}{' '}
          <span className="font-mono bg-gray-100 px-1 rounded">000000</span> {t('verify_demo_many')}
        </p>
      </div>
    </div>
  )
}
