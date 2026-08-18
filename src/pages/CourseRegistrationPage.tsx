import { useState } from 'react'
import { Search, AlertTriangle, CheckCircle, Info, Plus, Trash2 } from 'lucide-react'
import { useToast } from '../components/Toast'
import { useLanguage } from '../i18n/LanguageContext'

type Section = {
  id: string; courseCode: string; courseName: string; lecturer: string;
  schedule: string; room: string; credits: number; enrolled: number; capacity: number;
  prereqMet: boolean; conflict: boolean
}

const sections: Section[] = [
  { id: 'CS502-A', courseCode: 'CS502', courseName: 'Điện toán đám mây', lecturer: 'TS. Nguyễn Hoàng Nam', schedule: '2/4 07:30–09:10', room: 'B3-201', credits: 3, enrolled: 35, capacity: 40, prereqMet: true, conflict: false },
  { id: 'CS502-B', courseCode: 'CS502', courseName: 'Điện toán đám mây', lecturer: 'TS. Lê Văn Thành', schedule: '3/5 13:00–14:40', room: 'B3-202', credits: 3, enrolled: 40, capacity: 40, prereqMet: true, conflict: false },
  { id: 'SE401-A', courseCode: 'SE401', courseName: 'DevOps & CI/CD', lecturer: 'TS. Trần Đức Minh', schedule: '2/4 09:30–11:10', room: 'Lab 301', credits: 2, enrolled: 28, capacity: 30, prereqMet: true, conflict: false },
  { id: 'CS501-A', courseCode: 'CS501', courseName: 'Thị giác máy tính', lecturer: 'GS. Phạm Thị Lan', schedule: '2/4 13:00–14:40', room: 'Lab 204', credits: 3, enrolled: 22, capacity: 35, prereqMet: false, conflict: false },
  { id: 'CS503-A', courseCode: 'CS503', courseName: 'Xử lý ngôn ngữ tự nhiên', lecturer: 'TS. Võ Thị Kim Anh', schedule: '3/5 07:30–09:10', room: 'B2-305', credits: 3, enrolled: 18, capacity: 35, prereqMet: true, conflict: false },
  { id: 'IT401-A', courseCode: 'IT401', courseName: 'An ninh thông tin', lecturer: 'TS. Nguyễn Văn Bảo', schedule: '2/4 07:30–09:10', room: 'A1-401', credits: 3, enrolled: 30, capacity: 35, prereqMet: true, conflict: true },
]

export default function CourseRegistrationPage() {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<Section[]>([])
  const [confirm, setConfirm] = useState<Section | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const filtered = sections.filter(s =>
    search === '' ||
    s.courseName.toLowerCase().includes(search.toLowerCase()) ||
    s.courseCode.toLowerCase().includes(search.toLowerCase())
  )

  const totalCredits = cart.reduce((sum, s) => sum + s.credits, 0)

  const addToCart = (s: Section) => {
    if (cart.find(c => c.id === s.id)) return
    const updated = s.conflict
      ? { ...s, conflict: true }
      : { ...s, conflict: cart.some(c => c.schedule === s.schedule) }
    setCart(prev => [...prev, updated])
  }

  const register = (s: Section) => {
    setConfirm(null)
    setSuccess(s.courseName)
    toast('success', t('toast_reg_title'), `${t('toast_reg_prefix')} ${s.courseName}`)
    setTimeout(() => setSuccess(null), 4000)
  }

  const inCart = (id: string) => cart.some(c => c.id === id)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t('reg_title')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('reg_subtitle')}</p>
      </div>

      {/* Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-blue-700">
        <Info size={15} className="flex-shrink-0 mt-0.5 text-blue-500" />
        <span>{t('reg_banner')} <strong>20 {t('credits')}</strong>. {t('reg_banner_selected')} <strong>{totalCredits} {t('reg_banner_credits')}</strong></span>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-green-700">
          <CheckCircle size={15} className="text-green-500" />
          {t('reg_success')} <strong>{success}</strong>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Available sections */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('reg_search')}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] bg-white"
            />
          </div>

          <div className="space-y-2.5">
            {filtered.map(s => {
              const full = s.enrolled >= s.capacity
              const alreadyIn = inCart(s.id)
              const fillPct = (s.enrolled / s.capacity) * 100

              return (
                <div key={s.id} className={`bg-white rounded-xl border shadow-sm p-4 transition-all ${
                  !s.prereqMet ? 'border-amber-200 opacity-75' :
                  s.conflict ? 'border-orange-200' :
                  alreadyIn ? 'border-blue-300 bg-blue-50/30' :
                  'border-gray-100 hover:border-gray-200'
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-bold text-[#1E3A8A]">{s.id}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500">{s.credits} {t('credits')}</span>
                        {s.conflict && (
                          <span className="flex items-center gap-0.5 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">
                            <AlertTriangle size={10} /> {t('reg_conflict')}
                          </span>
                        )}
                        {!s.prereqMet && (
                          <span className="flex items-center gap-0.5 text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">
                            <AlertTriangle size={10} /> {t('reg_prereq_missing')}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800">{s.courseName}</h3>
                      <div className="text-xs text-gray-500 mt-0.5">{s.lecturer} · {s.schedule} · {s.room}</div>
                    </div>
                    <button
                      disabled={full || alreadyIn || !s.prereqMet}
                      onClick={() => setConfirm(s)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        alreadyIn ? 'bg-blue-100 text-blue-600 cursor-default' :
                        full ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                        !s.prereqMet ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                        'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                      }`}
                    >
                      {alreadyIn ? <><CheckCircle size={12} /> {t('reg_btn_added')}</> :
                       full ? t('reg_btn_full') :
                       !s.prereqMet ? t('reg_btn_locked') :
                       <><Plus size={12} /> {t('reg_btn_register')}</>}
                    </button>
                  </div>

                  {/* Capacity bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${fillPct >= 100 ? 'bg-red-400' : fillPct >= 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{ width: `${Math.min(fillPct, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${full ? 'text-red-500' : fillPct >= 80 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {s.enrolled}/{s.capacity} {full ? `(${t('full')})` : ''}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-fit sticky top-4">
          <h2 className="font-semibold text-gray-900 mb-1">{t('reg_cart_title')}</h2>
          <p className="text-xs text-gray-400 mb-4">{t('reg_cart_total')} {totalCredits} {t('reg_cart_credits')}</p>

          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Search size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t('reg_cart_empty')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(s => (
                <div key={s.id} className={`flex items-start gap-2 p-2.5 rounded-lg border ${s.conflict ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#1E3A8A]">{s.courseCode}</div>
                    <div className="text-xs text-gray-700 truncate">{s.courseName}</div>
                    <div className="text-xs text-gray-400">{s.credits} {t('reg_cart_credits')} · {s.schedule}</div>
                    {s.conflict && <div className="text-xs text-orange-600 flex items-center gap-0.5 mt-0.5"><AlertTriangle size={10} /> {t('reg_cart_conflict')}</div>}
                  </div>
                  <button onClick={() => setCart(prev => prev.filter(c => c.id !== s.id))} className="text-gray-300 hover:text-red-400 flex-shrink-0 mt-0.5">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-500">{t('reg_total_credits')}</span>
                <span className="font-bold text-gray-900">{totalCredits}</span>
              </div>
              {cart.some(s => s.conflict) && (
                <div className="flex items-start gap-1.5 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg mb-3">
                  <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" /> {t('reg_conflict_warning')}
                </div>
              )}
              <button
                disabled={cart.some(s => s.conflict)}
                onClick={() => { register(cart[0]); setCart([]) }}
                className="w-full bg-[#16A34A] hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {t('reg_cart_confirm')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{t('reg_modal_title')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('reg_modal_body')}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm">
              <div className="font-semibold text-gray-800">{confirm.courseName}</div>
              <div className="text-xs text-gray-500 mt-1">{confirm.id} · {confirm.credits} {t('credits')}</div>
              <div className="text-xs text-gray-500">{confirm.schedule} · {confirm.room}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirm(null)} className="flex-1 border border-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={() => { addToCart(confirm); register(confirm) }} className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-2 rounded-lg text-sm">{t('reg_btn_register')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
