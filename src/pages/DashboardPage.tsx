import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  BookOpen, Award, TrendingUp, Clock, Bell, Calendar, ClipboardList,
  Settings, ChevronRight, ArrowUpRight, GraduationCap, AlertCircle, Shield
} from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { studentProfile } from '../data/student'

const gpaData = [
  { sem: 'HK1–2021', gpa: 3.2 },
  { sem: 'HK2–2022', gpa: 3.45 },
  { sem: 'HK1–2022', gpa: 3.3 },
  { sem: 'HK2–2023', gpa: 3.6 },
  { sem: 'HK1–2023', gpa: 3.55 },
  { sem: 'HK2–2024', gpa: 3.72 },
  { sem: 'HK1–2024', gpa: 3.8 },
]

function GpaTrendChart() {
  return (
    <div translate="no" className="notranslate">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={gpaData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="sem" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis domain={[2.5, 4]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            formatter={(v) => [Number(v).toFixed(2), 'Điểm TB']}
          />
          <Line type="monotone" dataKey="gpa" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.FC<{ size?: number; className?: string }>; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        <ArrowUpRight size={14} className="text-gray-300" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const todayClasses = [
    { time: '07:30', end: '09:10', code: 'CS301', name: 'Cấu trúc dữ liệu & Giải thuật', room: 'B2-401', color: 'bg-blue-100 border-blue-400 text-blue-800', type: 'In-person' },
    { time: '09:30', end: '11:10', code: 'MA201', name: 'Xác suất thống kê', room: 'A1-202', color: 'bg-violet-100 border-violet-400 text-violet-800', type: 'In-person' },
    { time: '13:00', end: '14:40', code: 'CS401', name: 'Học máy', room: 'Online', color: 'bg-emerald-100 border-emerald-400 text-emerald-800', type: 'Online' },
  ]

  const announcements = [
    { title: t('dashboard_ann1_title'), body: t('dashboard_ann1_body'), time: t('dashboard_ann1_time'), type: 'info', badge: t('dashboard_badge_registration') },
    { title: t('dashboard_ann2_title'), body: t('dashboard_ann2_body'), time: t('dashboard_ann2_time'), type: 'warning', badge: t('dashboard_badge_finance') },
    { title: t('dashboard_ann3_title'), body: t('dashboard_ann3_body'), time: t('dashboard_ann3_time'), type: 'security', badge: t('dashboard_badge_security') },
  ]

  const assignments = [
    { course: 'CS301', title: 'Bài thực hành 3: Cây nhị phân', due: '18/8/2025', status: 'pending' },
    { course: 'MA201', title: 'Bài tập số 5', due: '20/8/2025', status: 'pending' },
    { course: 'CS401', title: 'Triển khai mô hình học máy', due: '25/8/2025', status: 'in_progress' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">{t('dashboard_greeting')}</p>
            <h1 className="text-2xl font-bold mb-1">{studentProfile.fullName}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-blue-200">
              <span className="flex items-center gap-1"><GraduationCap size={13} /> {t('dashboard_major_label')}</span>
              <span>·</span>
              <span>{t('dashboard_intake')} · {t('dashboard_year')}</span>
              <span>·</span>
              <span className="font-mono text-blue-100">{studentProfile.studentId}</span>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-4xl font-bold">3.80</div>
            <div className="text-blue-200 text-sm">{t('dashboard_current_gpa')}</div>
          </div>
        </div>

        {/* Degree progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-blue-200">{t('dashboard_degree_completion')}</span>
            <span className="text-white font-semibold">118 / 135 {t('dashboard_credits_unit')} (87%)</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: '87%' }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label={t('dashboard_stat_enrolled')} value="5" sub={t('dashboard_stat_enrolled_sub')} color="bg-blue-50 text-blue-600" />
        <StatCard icon={Award} label={t('dashboard_stat_credits')} value="118" sub={t('dashboard_stat_credits_sub')} color="bg-violet-50 text-violet-600" />
        <StatCard icon={TrendingUp} label={t('dashboard_stat_cgpa')} value="3.72" sub={t('dashboard_stat_cgpa_sub')} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={GraduationCap} label={t('dashboard_stat_standing')} value={t('dashboard_stat_standing_val')} sub={t('dashboard_stat_standing_sub')} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPA Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{t('dashboard_gpa_trend')}</h2>
            <span className="text-xs text-gray-400">{t('dashboard_gpa_last')}</span>
          </div>
          <GpaTrendChart />
        </div>

        {/* Today's schedule */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{t('dashboard_today_classes')}</h2>
            <button onClick={() => navigate('/schedule')} className="text-xs text-[#2563EB] hover:text-[#1E3A8A] flex items-center gap-0.5">
              {t('dashboard_view_all')} <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2.5">
            {todayClasses.map(cls => (
              <div key={cls.code} className={`flex gap-3 p-3 rounded-xl border-l-4 ${cls.color}`}>
                <div className="text-center min-w-[48px]">
                  <div className="text-xs font-bold">{cls.time}</div>
                  <div className="text-xs text-gray-400">{cls.end}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs">{cls.code}</div>
                  <div className="text-xs text-gray-600 truncate">{cls.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-gray-400">{cls.room}</span>
                    {cls.type === 'Online' && <span className="text-xs bg-green-100 text-green-700 px-1 rounded">{t('online')}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{t('dashboard_announcements')}</h2>
            <button onClick={() => navigate('/notifications')} className="text-xs text-[#2563EB] hover:text-[#1E3A8A] flex items-center gap-0.5">
              {t('dashboard_view_all')} <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.title} className={`flex gap-3 p-3 rounded-xl border ${
                a.type === 'warning' ? 'bg-amber-50 border-amber-100' :
                a.type === 'security' ? 'bg-blue-50 border-blue-100' :
                'bg-gray-50 border-gray-100'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  a.type === 'warning' ? 'bg-amber-100' :
                  a.type === 'security' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {a.type === 'security' ? <Shield size={15} className="text-blue-600" /> :
                   a.type === 'warning' ? <AlertCircle size={15} className="text-amber-600" /> :
                   <Bell size={15} className="text-gray-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900">{a.title}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      a.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                      a.type === 'security' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{a.badge}</span>
                  </div>
                  <p className="text-xs text-gray-600">{a.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming & Quick actions */}
        <div className="space-y-4">
          {/* Upcoming */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">{t('dashboard_upcoming')}</h2>
            <div className="space-y-2">
              {assignments.map(a => (
                <div key={a.title} className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-400'}`} />
                  <div>
                    <div className="text-xs font-medium text-gray-800">{a.title}</div>
                    <div className="text-xs text-gray-400">{a.course} · {t('dashboard_due')} {a.due}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">{t('dashboard_quick')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Calendar, label: t('dashboard_quick_schedule'), to: '/schedule', color: 'text-blue-600 bg-blue-50' },
                { icon: GraduationCap, label: t('dashboard_quick_grades'), to: '/grades', color: 'text-violet-600 bg-violet-50' },
                { icon: ClipboardList, label: t('dashboard_quick_register'), to: '/course-registration', color: 'text-emerald-600 bg-emerald-50' },
                { icon: Settings, label: t('dashboard_quick_security'), to: '/settings', color: 'text-slate-600 bg-slate-50' },
              ].map(({ icon: Icon, label, to, color }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${color} hover:opacity-80 transition-opacity`}
                >
                  <Icon size={18} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
