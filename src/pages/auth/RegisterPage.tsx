import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'
import { getUser, registerUser } from '../../lib/mockAuth'

function PasswordStrength({ password }: { password: string }) {
  const { t } = useLanguage()
  const checks = [
    { label: t('pwd_req_length'), ok: password.length >= 8 },
    { label: t('pwd_req_upper'), ok: /[A-Z]/.test(password) },
    { label: t('pwd_req_lower'), ok: /[a-z]/.test(password) },
    { label: t('pwd_req_number'), ok: /\d/.test(password) },
    { label: t('pwd_req_special'), ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const strengthLabels = ['', t('pwd_strength_weak'), t('pwd_strength_fair'), t('pwd_strength_good'), t('pwd_strength_strong'), t('pwd_strength_very')]
  const strengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500'][score]
  const textColor = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'][score]
  if (!password) return null
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1 items-center">
        {[1,2,3,4,5].map(i => <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= score ? strengthColor : 'bg-gray-200'}`} />)}
        <span className={`text-xs font-medium ml-1 ${textColor}`}>{strengthLabels[score]}</span>
      </div>
      <ul className="space-y-0.5">
        {checks.map(({ label, ok }) => (
          <li key={label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
            {ok ? <CheckCircle size={11} /> : <XCircle size={11} />} {label}
          </li>
        ))}
      </ul>
    </div>
  )
}

const faculties = ['Faculty of Computer Science', 'Faculty of Electrical Engineering', 'Faculty of Mechanical Engineering', 'Faculty of Economics', 'Faculty of Business Administration']
const majors: Record<string, string[]> = {
  'Faculty of Computer Science': ['Software Engineering', 'Computer Networks', 'Artificial Intelligence', 'Information Systems'],
  'Faculty of Electrical Engineering': ['Electronics', 'Power Systems', 'Control Engineering'],
  'Faculty of Mechanical Engineering': ['Mechanical Design', 'Industrial Engineering'],
  'Faculty of Economics': ['Economics', 'Finance', 'Accounting'],
  'Faculty of Business Administration': ['Business Administration', 'Marketing', 'Human Resources'],
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [form, setForm] = useState({ fullName: '', studentId: '', email: '', phone: '', faculty: '', major: '', intake: '', password: '', confirmPassword: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.fullName.trim()) e.fullName = t('register_err_name')
    if (!form.studentId.trim()) e.studentId = t('register_err_id_required')
    if (form.studentId === 'SV2021000001') e.studentId = t('register_err_id_exists')
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = t('register_err_email')
    if (form.email === 'taken@student.edu.vn' || getUser(form.email)) e.email = t('register_err_email_taken')
    if (!form.phone.trim()) e.phone = t('register_err_phone')
    if (!form.faculty) e.faculty = t('register_err_faculty')
    if (!form.major) e.major = t('register_err_major')
    if (!form.intake) e.intake = t('register_err_intake')
    const pwdOk = [form.password.length >= 8, /[A-Z]/.test(form.password), /[a-z]/.test(form.password), /\d/.test(form.password), /[^A-Za-z0-9]/.test(form.password)]
    if (!pwdOk.every(Boolean)) e.password = t('register_err_password')
    if (form.password !== form.confirmPassword) e.confirmPassword = t('register_err_confirm')
    if (!agreed) e.agreed = t('register_err_agree')
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    setTouched(Object.fromEntries(Object.keys(errs).map(k => [k, true])))
    if (Object.keys(errs).length > 0) return
    setLoading(true)
    registerUser(form.email, form.password, form.fullName).then(() => {
      setLoading(false)
      navigate('/verify', { state: { email: form.email.trim().toLowerCase() } })
    })
  }

  const field = (key: string, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={(form as Record<string, string>)[key]}
        onChange={e => set(key, e.target.value)}
        onBlur={() => setTouched(t => ({ ...t, [key]: true }))}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
          errors[key] && touched[key] ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-[#2563EB]/30 focus:border-[#2563EB]'
        }`}
      />
      {errors[key] && touched[key] && <p className="text-xs text-red-600 mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-blue-50/30 to-[#EFF6FF] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1E3A8A] rounded-2xl mb-3 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="text-xl font-bold text-[#1E3A8A]">{t('brand_name')}</div>
          <div className="text-xs text-gray-500">{t('register_subheading')}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <h1 className="text-lg font-bold text-gray-900 mb-5">{t('register_heading')}</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field('fullName', t('register_full_name'), 'text', 'Nguyen Van An')}
              {field('studentId', t('register_student_id'), 'text', 'SV2021004521')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field('email', t('register_email'), 'email', 'name@student.edu.vn')}
              {field('phone', t('register_phone'), 'tel', '0901 234 567')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register_faculty')}</label>
              <select
                value={form.faculty}
                onChange={e => { set('faculty', e.target.value); set('major', '') }}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white ${errors.faculty && touched.faculty ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-[#2563EB]/30 focus:border-[#2563EB]'}`}
              >
                <option value="">{t('register_faculty_placeholder')}</option>
                {faculties.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {errors.faculty && touched.faculty && <p className="text-xs text-red-600 mt-1">{errors.faculty}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register_major')}</label>
                <select
                  value={form.major}
                  onChange={e => set('major', e.target.value)}
                  disabled={!form.faculty}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white disabled:bg-gray-50 disabled:text-gray-400 ${errors.major && touched.major ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-[#2563EB]/30 focus:border-[#2563EB]'}`}
                >
                  <option value="">{t('register_major_placeholder')}</option>
                  {(majors[form.faculty] ?? []).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.major && touched.major && <p className="text-xs text-red-600 mt-1">{errors.major}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register_intake')}</label>
                <select
                  value={form.intake}
                  onChange={e => set('intake', e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white ${errors.intake && touched.intake ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-[#2563EB]/30 focus:border-[#2563EB]'}`}
                >
                  <option value="">{t('register_intake_placeholder')}</option>
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.intake && touched.intake && <p className="text-xs text-red-600 mt-1">{errors.intake}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register_password')}</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  onBlur={() => setTouched(tt => ({ ...tt, password: true }))}
                  placeholder={t('register_password_placeholder')}
                  className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.password && touched.password ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-[#2563EB]/30 focus:border-[#2563EB]'}`}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && touched.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              <PasswordStrength password={form.password} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register_confirm_password')}</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  onBlur={() => setTouched(tt => ({ ...tt, confirmPassword: true }))}
                  placeholder={t('register_confirm_placeholder')}
                  className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-[#2563EB]/30 focus:border-[#2563EB]'}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={11} /> {t('register_pwd_match')}</p>
              )}
            </div>

            <div>
              <label className={`flex items-start gap-2.5 cursor-pointer ${errors.agreed ? 'text-red-600' : ''}`}>
                <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErrors(er => ({ ...er, agreed: '' })) }} className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#2563EB]" />
                <span className="text-sm text-gray-600">
                  {t('register_agree')}{' '}
                  <a href="#" className="text-[#2563EB] hover:underline">{t('register_terms')}</a>
                  {' '}{t('register_and')}{' '}
                  <a href="#" className="text-[#2563EB] hover:underline">{t('register_privacy')}</a>
                </span>
              </label>
              {errors.agreed && <p className="text-xs text-red-600 mt-1 ml-6">{errors.agreed}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> {t('register_btn_loading')}</> : t('register_btn')}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-gray-600">
            {t('register_has_account')}{' '}
            <Link to="/login" className="text-[#2563EB] hover:text-[#1E3A8A] font-medium">{t('register_sign_in')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
