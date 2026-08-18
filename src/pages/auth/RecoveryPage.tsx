import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Shield, KeyRound, Mail, Phone, CheckCircle, AlertCircle, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'
import { verifyRecoveryCode } from '../../lib/mockAuth'
import { studentProfile } from '../../data/student'

type Method = 'code' | 'email' | 'support'
type State = 'idle' | 'loading' | 'invalid' | 'success' | 'used'

export default function RecoveryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const email = (location.state as { email?: string } | null)?.email ?? studentProfile.email
  const [method, setMethod] = useState<Method>('code')
  const [code, setCode] = useState('')
  const [state, setState] = useState<State>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setState('loading')
    setTimeout(() => {
      const ok = verifyRecoveryCode(email, code)
      if (!ok) return setState('invalid')
      setState('success')
    }, 900)
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-blue-50/30 to-[#EFF6FF] flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#16A34A]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('recovery_success_title')}</h1>
          <p className="text-sm text-gray-500 mb-4">{t('recovery_success_body')}</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 text-left mb-6 flex items-start gap-2">
            <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold mb-1">{t('recovery_success_action_title')}</div>
              {t('recovery_success_action_body')}
            </div>
          </div>
          <button onClick={() => navigate('/settings')} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-2.5 rounded-lg transition-colors mb-3">
            {t('recovery_success_reconfigure')}
          </button>
          <button onClick={() => navigate('/dashboard')} className="w-full text-gray-500 hover:text-gray-700 text-sm py-2">
            {t('recovery_success_skip')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-blue-50/30 to-[#EFF6FF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1E3A8A] rounded-2xl mb-3 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="text-xl font-bold text-[#1E3A8A]">{t('brand_name')}</div>
          <div className="text-xs text-gray-500">{t('recovery_subtitle')}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <h1 className="text-xl font-bold text-gray-900 mb-1">{t('recovery_title')}</h1>
          <p className="text-sm text-gray-500 mb-5">{t('recovery_choose')}</p>

          {/* Method selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { id: 'code' as Method, icon: KeyRound, label: t('recovery_code_tab') },
              { id: 'email' as Method, icon: Mail, label: t('recovery_email_tab') },
              { id: 'support' as Method, icon: Phone, label: t('recovery_support_tab') },
            ].map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => { setMethod(id); setState('idle') }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${method === id ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                <Icon size={20} />
                <span className="text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>

          {/* Recovery Code */}
          {method === 'code' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 flex items-start gap-2">
                <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                {t('recovery_code_warning')}
              </div>
              {state === 'invalid' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle size={14} className="text-red-500" /> {t('recovery_err_invalid')}
                </div>
              )}
              {state === 'used' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle size={14} className="text-red-500" /> {t('recovery_err_used')}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('recovery_code_label')}</label>
                <input type="text" value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setState('idle') }}
                  placeholder={t('recovery_code_placeholder')}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] ${state === 'invalid' || state === 'used' ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} />
                <p className="text-xs text-gray-400 mt-1">{t('recovery_code_hint')}</p>
              </div>
              <button type="submit" disabled={!code || state === 'loading'}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2">
                {state === 'loading' ? <><Loader2 size={16} className="animate-spin" /> {t('recovery_code_verifying')}</> : t('recovery_code_btn')}
              </button>
            </form>
          )}

          {/* Email verify */}
          {method === 'email' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto"><Mail className="w-6 h-6 text-[#2563EB]" /></div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('recovery_email_title')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('recovery_email_body')}</p>
              </div>
              <button onClick={() => navigate('/forgot-password')} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-2.5 rounded-lg">{t('recovery_email_btn')}</button>
            </div>
          )}

          {/* Support */}
          {method === 'support' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('recovery_support_title')}</h3>
                <p className="text-sm text-gray-600 mb-3">{t('recovery_support_body')}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700"><Phone size={14} className="text-[#2563EB]" /><span>+84 28 3896 8641 (ext. 1234)</span></div>
                  <div className="flex items-center gap-2 text-gray-700"><Mail size={14} className="text-[#2563EB]" /><span>itsupport@uth.edu.vn</span></div>
                </div>
                <div className="mt-3 text-xs text-gray-500">{t('recovery_support_hours')}</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 flex items-start gap-2">
                <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                {t('recovery_support_notice')}
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <Link to="/two-factor" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1.5">
            <ArrowLeft size={14} /> {t('recovery_back')}
          </Link>
        </div>
      </div>
    </div>
  )
}
