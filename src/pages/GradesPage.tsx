import { useState } from 'react'
import { Download, TrendingUp, Award, BookOpen, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useLanguage } from '../i18n/LanguageContext'

const gpaData = [
  { sem: 'HK1–2021', gpa: 3.2 }, { sem: 'HK2–2022', gpa: 3.45 },
  { sem: 'HK1–2022', gpa: 3.3 }, { sem: 'HK2–2023', gpa: 3.6 },
  { sem: 'HK1–2023', gpa: 3.55 }, { sem: 'HK2–2024', gpa: 3.72 },
  { sem: 'HK1–2024', gpa: 3.8 },
]

const semesters = ['Tất cả học kỳ', 'HK1 2024–2025', 'HK2 2023–2024', 'HK1 2023–2024', 'HK2 2022–2023', 'HK1 2022–2023', 'HK2 2021–2022', 'HK1 2021–2022']

type Grade = {
  code: string; name: string; credits: number;
  attendance: number; midterm: number; final: number; total: number;
  letter: string; status: 'passed' | 'failed' | 'pending'
}

const grades: Grade[] = [
  { code: 'CS301', name: 'Cấu trúc dữ liệu & Giải thuật', credits: 3, attendance: 9.5, midterm: 8.2, final: 8.8, total: 8.8, letter: 'B+', status: 'passed' },
  { code: 'MA201', name: 'Xác suất thống kê', credits: 3, attendance: 8.8, midterm: 7.5, final: 8.0, total: 8.0, letter: 'B', status: 'passed' },
  { code: 'CS401', name: 'Học máy', credits: 4, attendance: 10, midterm: 9.0, final: 9.2, total: 9.2, letter: 'A', status: 'passed' },
  { code: 'SE302', name: 'Kiến trúc phần mềm', credits: 3, attendance: 9.0, midterm: 8.5, final: 8.7, total: 8.7, letter: 'B+', status: 'passed' },
  { code: 'EN301', name: 'Tiếng Anh chuyên ngành', credits: 2, attendance: 8.5, midterm: 7.0, final: 7.5, total: 7.5, letter: 'B', status: 'passed' },
  { code: 'DB201', name: 'Hệ quản trị cơ sở dữ liệu', credits: 3, attendance: 9.2, midterm: 5.5, final: 4.8, total: 5.2, letter: 'D', status: 'failed' },
  { code: 'OS302', name: 'Hệ điều hành', credits: 3, attendance: 7.0, midterm: 7.8, final: 8.1, total: 7.9, letter: 'B', status: 'passed' },
  { code: 'CS501', name: 'Thị giác máy tính', credits: 3, attendance: null as unknown as number, midterm: null as unknown as number, final: null as unknown as number, total: null as unknown as number, letter: '–', status: 'pending' },
]

const statusBadge: Record<string, string> = {
  passed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
}

function SemesterBarChart() {
  return (
    <div translate="no" className="notranslate">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={gpaData} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="sem" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis domain={[2.5, 4]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} formatter={(v) => [Number(v).toFixed(2), 'Điểm TB']} />
          <Bar dataKey="gpa" fill="#2563EB" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function score(v: number | null) {
  if (v === null || v === undefined) return '–'
  return v.toFixed(1)
}

function letterColor(l: string) {
  if (l === 'A' || l === 'A+') return 'text-emerald-600 font-bold'
  if (l.startsWith('B')) return 'text-blue-600 font-semibold'
  if (l.startsWith('C')) return 'text-amber-600'
  if (l.startsWith('D') || l === 'F') return 'text-red-600 font-semibold'
  return 'text-gray-400'
}

export default function GradesPage() {
  const { t } = useLanguage()
  const [semester, setSemester] = useState('Tất cả học kỳ')

  const passed = grades.filter(g => g.status === 'passed').length
  const failed = grades.filter(g => g.status === 'failed').length

  const statusLabel: Record<string, string> = {
    passed: t('status_passed'),
    failed: t('status_failed'),
    pending: t('status_pending'),
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('grades_title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('grades_subtitle')}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-colors">
          <Download size={14} /> {t('grades_download')}
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: t('grades_stat_sem_gpa'), value: '3.80', color: 'text-blue-600 bg-blue-50' },
          { icon: Award, label: t('grades_stat_cgpa'), value: '3.72', color: 'text-violet-600 bg-violet-50' },
          { icon: BookOpen, label: t('grades_stat_passed'), value: `${passed}`, sub: `${failed} ${t('grades_stat_failed')}`, color: 'text-emerald-600 bg-emerald-50' },
          { icon: XCircle, label: t('grades_stat_credits'), value: '118', sub: t('grades_stat_credits_of'), color: 'text-amber-600 bg-amber-50' },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <div className="text-xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
            {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">{t('grades_chart_title')}</h2>
        <SemesterBarChart />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t('grades_table_title')}</h2>
          <select
            value={semester}
            onChange={e => setSemester(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 bg-white"
          >
            {semesters.map((s, i) => <option key={s}>{i === 0 ? t('grades_all_semesters') : s}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs">
                <th className="text-left px-5 py-3 font-medium">{t('grades_col_course')}</th>
                <th className="text-center px-3 py-3 font-medium">{t('grades_col_credits')}</th>
                <th className="text-center px-3 py-3 font-medium hidden md:table-cell">{t('grades_col_attendance')}</th>
                <th className="text-center px-3 py-3 font-medium hidden md:table-cell">{t('grades_col_midterm')}</th>
                <th className="text-center px-3 py-3 font-medium hidden md:table-cell">{t('grades_col_final')}</th>
                <th className="text-center px-3 py-3 font-medium">{t('grades_col_total')}</th>
                <th className="text-center px-3 py-3 font-medium">{t('grades_col_grade')}</th>
                <th className="text-center px-3 py-3 font-medium">{t('grades_col_status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {grades.map(g => (
                <tr key={g.code} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-gray-800 text-xs">{g.code}</div>
                    <div className="text-gray-500 text-xs">{g.name}</div>
                  </td>
                  <td className="text-center px-3 py-3.5 text-gray-700">{g.credits}</td>
                  <td className="text-center px-3 py-3.5 text-gray-600 hidden md:table-cell">{score(g.attendance)}</td>
                  <td className="text-center px-3 py-3.5 text-gray-600 hidden md:table-cell">{score(g.midterm)}</td>
                  <td className="text-center px-3 py-3.5 text-gray-600 hidden md:table-cell">{score(g.final)}</td>
                  <td className="text-center px-3 py-3.5 font-semibold text-gray-800">{score(g.total)}</td>
                  <td className={`text-center px-3 py-3.5 ${letterColor(g.letter)}`}>{g.letter}</td>
                  <td className="text-center px-3 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[g.status]}`}>
                      {statusLabel[g.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
