import { useState } from 'react'
import { Search, BookOpen, ChevronRight, CheckCircle, Clock, Circle } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

type Status = 'completed' | 'in_progress' | 'not_started'

type Course = {
  code: string; name: string; credits: number; type: 'Required' | 'Elective';
  faculty: string; prerequisite: string | null; description: string; status: Status
}

const allCourses: Course[] = [
  { code: 'CS101', name: 'Nhập môn lập trình', credits: 3, type: 'Required', faculty: 'Khoa học máy tính', prerequisite: null, description: 'Nền tảng lập trình với Python. Biến, cấu trúc điều khiển, hàm và lập trình hướng đối tượng cơ bản.', status: 'completed' },
  { code: 'MA101', name: 'Giải tích 1', credits: 3, type: 'Required', faculty: 'Toán học', prerequisite: null, description: 'Giới hạn, đạo hàm, tích phân và ứng dụng trong kỹ thuật và khoa học.', status: 'completed' },
  { code: 'CS201', name: 'Lập trình hướng đối tượng', credits: 3, type: 'Required', faculty: 'Khoa học máy tính', prerequisite: 'CS101', description: 'Lập trình hướng đối tượng trong Java: đóng gói, kế thừa, đa hình, mẫu thiết kế.', status: 'completed' },
  { code: 'CS301', name: 'Cấu trúc dữ liệu & Giải thuật', credits: 3, type: 'Required', faculty: 'Khoa học máy tính', prerequisite: 'CS201', description: 'Cây, đồ thị, các thuật toán sắp xếp và tìm kiếm. Phân tích độ phức tạp.', status: 'in_progress' },
  { code: 'CS401', name: 'Học máy', credits: 4, type: 'Elective', faculty: 'Khoa học máy tính', prerequisite: 'MA201', description: 'Học có giám sát và không giám sát, mạng nơ-ron, đánh giá mô hình.', status: 'in_progress' },
  { code: 'SE302', name: 'Kiến trúc phần mềm', credits: 3, type: 'Required', faculty: 'Kỹ thuật phần mềm', prerequisite: 'CS201', description: 'Các mẫu kiến trúc, microservices, thiết kế hệ thống và tài liệu kỹ thuật.', status: 'in_progress' },
  { code: 'MA201', name: 'Xác suất thống kê', credits: 3, type: 'Required', faculty: 'Toán học', prerequisite: 'MA101', description: 'Lý thuyết xác suất, phân phối, kiểm định giả thuyết, phân tích hồi quy.', status: 'in_progress' },
  { code: 'CS501', name: 'Thị giác máy tính', credits: 3, type: 'Elective', faculty: 'Khoa học máy tính', prerequisite: 'CS401', description: 'Xử lý ảnh, phát hiện đặc trưng, mạng nơ-ron tích chập, nhận diện vật thể.', status: 'not_started' },
  { code: 'CS502', name: 'Điện toán đám mây', credits: 3, type: 'Elective', faculty: 'Khoa học máy tính', prerequisite: null, description: 'Nền tảng AWS, Azure, GCP. Container hóa, Kubernetes, serverless computing.', status: 'not_started' },
  { code: 'SE401', name: 'DevOps & CI/CD', credits: 2, type: 'Elective', faculty: 'Kỹ thuật phần mềm', prerequisite: 'SE302', description: 'Tích hợp và triển khai liên tục, Docker, giám sát và quan sát hệ thống.', status: 'not_started' },
  { code: 'DB201', name: 'Hệ quản trị cơ sở dữ liệu', credits: 3, type: 'Required', faculty: 'Khoa học máy tính', prerequisite: 'CS101', description: 'Đại số quan hệ, SQL, chuẩn hóa, giao tác, chiến lược đánh chỉ mục.', status: 'completed' },
  { code: 'EN301', name: 'Tiếng Anh chuyên ngành', credits: 2, type: 'Required', faculty: 'Ngoại ngữ', prerequisite: null, description: 'Viết học thuật, soạn tài liệu kỹ thuật, kỹ năng thuyết trình cho kỹ sư.', status: 'in_progress' },
]

const faculties = ['Tất cả khoa', 'Khoa học máy tính', 'Kỹ thuật phần mềm', 'Toán học', 'Ngoại ngữ']
const creditOptions = ['Tất cả tín chỉ', '2 tín chỉ', '3 tín chỉ', '4 tín chỉ']
const statusOptions: ('all' | Status)[] = ['all', 'completed', 'in_progress', 'not_started']

export default function CoursesPage() {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [faculty, setFaculty] = useState('Tất cả khoa')
  const [credits, setCredits] = useState('Tất cả tín chỉ')
  const [status, setStatus] = useState<'all' | Status>('all')
  const [selected, setSelected] = useState<Course | null>(null)
  const [page, setPage] = useState(1)
  const PER_PAGE = 8

  const statusConfig: Record<Status, { icon: React.ReactNode; label: string; cls: string }> = {
    completed: { icon: <CheckCircle size={13} />, label: t('status_completed'), cls: 'bg-green-100 text-green-700' },
    in_progress: { icon: <Clock size={13} />, label: t('status_in_progress'), cls: 'bg-blue-100 text-blue-700' },
    not_started: { icon: <Circle size={13} />, label: t('status_not_started'), cls: 'bg-gray-100 text-gray-500' },
  }

  const statusBtnLabel = (s: 'all' | Status) => {
    if (s === 'all') return t('all')
    return statusConfig[s].label
  }

  const filtered = allCourses.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.code.toLowerCase().includes(search.toLowerCase())) return false
    if (faculty !== 'Tất cả khoa' && c.faculty !== faculty) return false
    if (credits !== 'Tất cả tín chỉ' && c.credits !== parseInt(credits)) return false
    if (status !== 'all' && c.status !== status) return false
    return true
  })

  const pages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t('courses_title')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('courses_subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder={t('courses_search')}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
          />
        </div>
        <select value={faculty} onChange={e => { setFaculty(e.target.value); setPage(1) }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30">
          {faculties.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={credits} onChange={e => { setCredits(e.target.value); setPage(1) }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30">
          {creditOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${status === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {statusBtnLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs">
              <th className="text-left px-5 py-3 font-medium">{t('courses_col_code')}</th>
              <th className="text-left px-3 py-3 font-medium">{t('courses_col_name')}</th>
              <th className="text-center px-3 py-3 font-medium">{t('courses_col_credits')}</th>
              <th className="text-center px-3 py-3 font-medium">{t('courses_col_type')}</th>
              <th className="text-left px-3 py-3 font-medium">{t('courses_col_prereq')}</th>
              <th className="text-center px-3 py-3 font-medium">{t('courses_col_status')}</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paged.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                {t('courses_empty')}
              </td></tr>
            ) : paged.map(c => (
              <tr key={c.code} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(c)}>
                <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[#1E3A8A]">{c.code}</td>
                <td className="px-3 py-3.5">
                  <div className="font-medium text-gray-800">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.faculty}</div>
                </td>
                <td className="text-center px-3 py-3.5 text-gray-600">{c.credits}</td>
                <td className="text-center px-3 py-3.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.type === 'Required' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    {c.type === 'Required' ? t('required') : t('elective')}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-xs text-gray-500">{c.prerequisite ?? '—'}</td>
                <td className="text-center px-3 py-3.5">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[c.status].cls}`}>
                    {statusConfig[c.status].icon} {statusConfig[c.status].label}
                  </span>
                </td>
                <td className="px-3 py-3.5"><ChevronRight size={14} className="text-gray-300" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paged.map(c => (
          <div key={c.code} onClick={() => setSelected(c)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-mono text-xs font-bold text-[#1E3A8A]">{c.code}</span>
                <h3 className="font-semibold text-gray-800 text-sm">{c.name}</h3>
              </div>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0 ${statusConfig[c.status].cls}`}>
                {statusConfig[c.status].label}
              </span>
            </div>
            <div className="flex gap-3 text-xs text-gray-400">
              <span>{c.credits} {t('credits')}</span>
              <span>{c.type === 'Required' ? t('required') : t('elective')}</span>
              {c.prerequisite && <span>Prereq: {c.prerequisite}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{t('showing')} {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} {t('of')} {filtered.length}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">{t('previous')}</button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} onClick={() => setPage(i+1)} className={`px-3 py-1.5 text-sm rounded-lg ${page === i+1 ? 'bg-[#2563EB] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{i+1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">{t('next')}</button>
          </div>
        </div>
      )}

      {/* Course detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="font-mono text-sm font-bold text-[#1E3A8A]">{selected.code}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">{selected.name}</h3>
              </div>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${statusConfig[selected.status].cls}`}>
                {statusConfig[selected.status].icon} {statusConfig[selected.status].label}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{selected.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm mb-5">
              <div><span className="text-gray-500">{t('courses_modal_credits')}</span><div className="font-semibold text-gray-800">{selected.credits}</div></div>
              <div><span className="text-gray-500">{t('courses_modal_type')}</span><div className="font-semibold text-gray-800">{selected.type === 'Required' ? t('required') : t('elective')}</div></div>
              <div><span className="text-gray-500">{t('courses_modal_faculty')}</span><div className="font-semibold text-gray-800">{selected.faculty}</div></div>
              <div><span className="text-gray-500">{t('courses_modal_prereq')}</span><div className="font-semibold text-gray-800">{selected.prerequisite ?? t('courses_modal_none')}</div></div>
            </div>
            <button onClick={() => setSelected(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm">{t('close')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
