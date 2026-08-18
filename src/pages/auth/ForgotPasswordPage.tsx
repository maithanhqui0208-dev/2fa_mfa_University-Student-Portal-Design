import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Mail, KeyRound, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

function OTPInputs({ value, onChange, error }: { value: string[]; onChange: (v: string[]) => void; error?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const hc = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return
    const n = [...value]; n[i] = v.slice(-1); onChange(n)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }
  const hk = (i: number, e: React.KeyboardEvent) => { if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus() }
  const hp = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) { onChange(text.split('')); refs.current[5]?.focus() }
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

function PasswordStrengthBar({ password }: { password: string }) {
  const { t } = useLanguage()
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)]
  const score = checks.filter(Boolean).length
  const labels = ['', t('pwd_strength_weak'), t('pwd_strength_fair'), t('pwd_strength_good'), t('pwd_strength_strong'), t('pwd_strength_very')]
  const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500']
  if (!password) return null
  return (
    <div className="mt-2">
      <div className="flex gap-1 items-center">
        {[1,2,3,4,5].map(i => <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= score ? colors[score] : 'bg-gray-200'}`} />)}
        <span className="text-xs ml-1 text-gray-500">{labels[score]}</span>
      </div>
      <ul className="mt-1.5 space-y-0.5">
        {[
          { l: t('pwd_req_length'), ok: checks[0] },
          { l: t('pwd_req_upper'), ok: checks[1] },
          { l: t('pwd_req_number'), ok: checks[3] },
          { l: t('pwd_req_special'), ok: checks[4] },
        ].map(({ l, ok }) => (
          <li key={l} className={`text-xs flex items-center gap-1 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle size={10} className={ok ? 'text-green-500' : 'text-gray-300'} /> {l}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(120)

  useEffect(() => {
    if (step !== 2 || timer <= 0) return
    const id = setTimeout(() => setTimer(ti => ti - 1), 1000)
    return () => clearTimeout(id)
  }, [step, timer])

  const mins = String(Math.floor(timer / 60)).padStart(2, '0')
  const secs = String(timer % 60).padStart(2, '0')

  const steps = [t('forgot_stepper_find'), t('forgot_stepper_verify'), t('forgot_stepper_newpwd'), t('forgot_stepper_success')]

  const next = (fn: () => void) => { setLoading(true); setTimeout(() => { setLoading(false); fn() }, 1000) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-blue-50/30 to-[#EFF6FF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1E3A8A] rounded-2xl mb-3 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="text-xl font-bold text-[#1E3A8A]">{t('brand_name')}</div>
          <div className="text-xs text-gray-500">{t('forgot_page_title')}</div>
        </div>

        {/* Stepper */}
        {step < 4 && (
          <div className="flex items-center mb-6 px-1">
            {steps.slice(0, 3).map((s, i) => (
              <div key={s} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i + 1 < step ? 'bg-[#16A34A] text-white' : i + 1 === step ? 'bg-[#2563EB] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {i + 1 < step ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1 font-medium text-center max-w-16 leading-tight ${i + 1 === step ? 'text-[#2563EB]' : 'text-gray-400'}`}>{s}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px mx-1 mb-4 ${i + 1 < step ? 'bg-[#16A34A]' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          {/* Step 1 */}
          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3"><Mail className="w-6 h-6 text-[#2563EB]" /></div>
                <h1 className="text-xl font-bold text-gray-900">{t('forgot_step1_title')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('forgot_step1_sub')}</p>
              </div>
              <form onSubmit={e => { e.preventDefault(); next(() => setStep(2)) }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('forgot_step1_label')}</label>
                  <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder={t('forgot_step1_placeholder')} required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" />
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
                  <AlertCircle size={13} className="mt-0.5 flex-shrink-0 text-blue-500" />
                  {t('forgot_step1_notice')}
                </div>
                <button type="submit" disabled={!identifier || loading}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> {t('forgot_step1_sending')}</> : t('forgot_step1_btn')}
                </button>
              </form>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3"><KeyRound className="w-6 h-6 text-[#2563EB]" /></div>
                <h1 className="text-xl font-bold text-gray-900">{t('forgot_step2_title')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('forgot_step2_sub')} <span className="font-medium text-gray-700">ng***@student.edu.vn</span></p>
              </div>
              <form onSubmit={e => {
                e.preventDefault()
                const code = otp.join('')
                if (code === '999999') { setOtpError(true); return }
                next(() => { setOtpError(false); setStep(3) })
              }} className="space-y-5">
                {otpError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <AlertCircle size={14} className="text-red-500" /> {t('forgot_step2_err')}
                  </div>
                )}
                <OTPInputs value={otp} onChange={v => { setOtp(v); setOtpError(false) }} error={otpError} />
                <div className="text-center text-sm text-gray-500">
                  {t('verify_expires')} <span className={`font-mono font-semibold ${timer <= 30 ? 'text-red-500' : 'text-[#2563EB]'}`}>{mins}:{secs}</span>
                  {' · '}
                  <button type="button" onClick={() => setTimer(120)} className="text-[#2563EB] hover:underline">{t('forgot_step2_resend')}</button>
                </div>
                <button type="submit" disabled={otp.join('').length < 6 || loading}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> {t('forgot_step2_verifying')}</> : t('forgot_step2_btn')}
                </button>
              </form>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3"><KeyRound className="w-6 h-6 text-[#2563EB]" /></div>
                <h1 className="text-xl font-bold text-gray-900">{t('forgot_step3_title')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('forgot_step3_sub')}</p>
              </div>
              <form onSubmit={e => { e.preventDefault(); if (password !== confirm || password.length < 8) return; next(() => setStep(4)) }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('forgot_step3_new_label')}</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t('register_password_placeholder')}
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                  <PasswordStrengthBar password={password} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('forgot_step3_confirm_label')}</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                      className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] ${confirm && password !== confirm ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                  {confirm && password !== confirm && <p className="text-xs text-red-600 mt-1">{t('register_err_confirm')}</p>}
                  {confirm && password === confirm && password.length >= 8 && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={10} /> {t('register_pwd_match')}</p>}
                </div>
                <button type="submit" disabled={!password || password !== confirm || loading}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> {t('forgot_step3_resetting')}</> : t('forgot_step3_btn')}
                </button>
              </form>
            </>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-[#16A34A]" /></div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">{t('forgot_step4_title')}</h1>
              <p className="text-sm text-gray-500 mb-4">{t('forgot_step4_body')}</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 text-left mb-6 flex items-start gap-2">
                <AlertCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" /> {t('forgot_step4_notice')}
              </div>
              <button onClick={() => navigate('/login')} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-2.5 rounded-lg">{t('forgot_step4_btn')}</button>
            </div>
          )}
        </div>

        {step > 1 && step < 4 && (
          <button onClick={() => setStep(s => s - 1)} className="mt-4 mx-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={14} /> {t('back')}
          </button>
        )}
        {step === 1 && (
          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1.5">
              <ArrowLeft size={14} /> {t('tfa_back')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
