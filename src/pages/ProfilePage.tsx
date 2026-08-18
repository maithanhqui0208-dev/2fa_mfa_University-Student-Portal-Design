import { useState } from 'react'
import { Camera, Edit2, Save, X, Lock, Info } from 'lucide-react'
import { useToast } from '../components/Toast'
import { useLanguage } from '../i18n/LanguageContext'
import { studentProfile } from '../data/student'

const READONLY_FIELDS = ['studentId', 'faculty', 'major', 'intake', 'academicStatus']

const initial = studentProfile

export default function ProfilePage() {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [form, setForm] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initial)
  const [saved, setSaved] = useState(false)

  const startEdit = () => { setDraft(form); setEditing(true) }
  const cancelEdit = () => { setDraft(form); setEditing(false) }
  const save = () => {
    setForm(draft)
    setEditing(false)
    setSaved(true)
    toast('success', t('toast_profile_title'), t('toast_profile_msg'))
    setTimeout(() => setSaved(false), 3000)
  }

  const Field = ({ label, k, type = 'text' }: { label: string; k: keyof typeof initial; type?: string }) => {
    const isReadonly = READONLY_FIELDS.includes(k)
    const val = editing ? draft[k] : form[k]
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {label}
          {isReadonly && <span className="ml-1.5 text-xs text-gray-400 inline-flex items-center gap-0.5"><Lock size={10} /> {t('profile_readonly')}</span>}
        </label>
        {editing && !isReadonly ? (
          k === 'gender' ? (
            <select
              value={draft.gender}
              onChange={e => setDraft(d => ({ ...d, gender: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] bg-white"
            >
              <option value="Nam">{t('profile_gender_male')}</option>
              <option value="Nữ">{t('profile_gender_female')}</option>
              <option value="Khác">{t('profile_gender_other')}</option>
            </select>
          ) : (
            <input
              type={type}
              value={val}
              onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
            />
          )
        ) : (
          <div className={`px-3 py-2 text-sm text-gray-800 rounded-lg ${isReadonly && editing ? 'bg-gray-50 text-gray-500' : ''}`}>{val || '—'}</div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('profile_title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('profile_subtitle')}</p>
        </div>
        {!editing ? (
          <button onClick={startEdit} className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-colors">
            <Edit2 size={14} /> {t('profile_edit')}
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={cancelEdit} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <X size={14} /> {t('profile_cancel')}
            </button>
            <button onClick={save} className="flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] hover:bg-green-700 text-white text-sm font-medium rounded-lg">
              <Save size={14} /> {t('profile_save')}
            </button>
          </div>
        )}
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <Save size={14} className="text-green-500" /> {t('profile_saved')}
        </div>
      )}

      {/* Avatar + card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Hero */}
        <div className="h-28 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB]" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-4 border-white bg-[#1E3A8A] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {studentProfile.avatarInitials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#2563EB] rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-[#1D4ED8] transition-colors">
                <Camera size={12} />
              </button>
            </div>
            <div className="mb-1">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">{t('profile_active')}</span>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">{form.fullName}</h2>
            <p className="text-sm text-gray-500">{form.studentId} · {form.major}</p>
          </div>

          {/* Readonly info banner */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 text-xs text-blue-700">
            <Info size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
            {t('profile_readonly_notice')}
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1 border-b border-gray-100">{t('profile_section_personal')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t('profile_full_name')} k="fullName" />
                <Field label={t('profile_student_id')} k="studentId" />
                <Field label={t('profile_dob')} k="dob" type="date" />
                <Field label={t('profile_gender')} k="gender" />
                <Field label={t('profile_email')} k="email" type="email" />
                <Field label={t('profile_phone')} k="phone" type="tel" />
              </div>
              <div className="mt-4">
                <Field label={t('profile_address')} k="address" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1 border-b border-gray-100">{t('profile_section_academic')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t('profile_faculty')} k="faculty" />
                <Field label={t('profile_major')} k="major" />
                <Field label={t('profile_intake')} k="intake" />
                <Field label={t('profile_status')} k="academicStatus" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
