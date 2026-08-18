import { useState } from 'react'
import { Bell, Shield, GraduationCap, CreditCard, Calendar, Search, CheckCheck, ChevronRight, Paperclip } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

type Category = 'all' | 'academic' | 'exam' | 'tuition' | 'event' | 'security'

type Notification = {
  id: number; title: string; body: string; time: string;
  read: boolean; category: Exclude<Category, 'all'>; attachment?: string
}

const initialNotifications: Notification[] = [
  { id: 1, title: 'Mở đăng ký học phần ngày 25/8', body: 'Đăng ký học phần Học kỳ 1, Năm học 2025–2026 sẽ bắt đầu vào ngày 25/8/2025. Hãy đảm bảo bạn đã đáp ứng đầy đủ điều kiện tiên quyết trước khi đăng ký.', time: '2 giờ trước', read: false, category: 'academic', attachment: 'huong_dan_dang_ky_hoc_phan.pdf' },
  { id: 2, title: 'Thời khóa biểu học kỳ 1 đã được công bố', body: 'Thời khóa biểu chính thức Học kỳ 1, 2025–2026 đã có. Kiểm tra lịch học của bạn trong cổng thông tin.', time: '5 giờ trước', read: false, category: 'academic' },
  { id: 3, title: 'Bật xác thực hai yếu tố (2FA)', body: 'Bảo vệ tài khoản UTHPortal bằng cách bật Google Authenticator 2FA. Vào Cài đặt > Bảo mật để thiết lập.', time: '1 ngày trước', read: false, category: 'security' },
  { id: 4, title: 'Hạn nộp học phí – 15/9', body: 'Học phí Học kỳ 1, 2025–2026 phải được nộp trước ngày 15/9/2025. Thanh toán trễ sẽ bị tính thêm 5% mỗi tuần.', time: '2 ngày trước', read: true, category: 'tuition' },
  { id: 5, title: 'Lịch thi giữa kỳ đã được công bố', body: 'Lịch thi giữa kỳ Học kỳ 1 đã được đăng tải. Thi diễn ra từ ngày 6–18/10/2025. Xem lịch chi tiết trong mục Kết quả học tập.', time: '3 ngày trước', read: true, category: 'exam', attachment: 'lich_thi_giua_ky_hk1_2025.pdf' },
  { id: 6, title: 'Danh sách sinh viên xuất sắc – HK2 2025', body: 'Chúc mừng! Bạn đã được ghi nhận vào danh sách sinh viên xuất sắc nhờ thành tích học tập nổi bật trong Học kỳ 2 năm 2025. Giấy chứng nhận sẽ được trao tại lễ khen thưởng.', time: '1 tuần trước', read: true, category: 'academic' },
  { id: 7, title: 'Ngày hội tuyển dụng công nghệ – 20/9', body: 'Ngày hội việc làm công nghệ thường niên của UTH sẽ diễn ra vào ngày 20/9/2025 tại Hội trường A, Tòa nhà B. Hơn 50 doanh nghiệp sẽ tham gia tuyển dụng.', time: '1 tuần trước', read: true, category: 'event' },
  { id: 8, title: 'Phát hiện đăng nhập đáng ngờ', body: 'Có người đã cố đăng nhập vào tài khoản của bạn từ vị trí không xác định (IP: 203.xxx.xxx.xx). Nếu không phải bạn, hãy đổi mật khẩu ngay.', time: '2 tuần trước', read: true, category: 'security' },
]

export default function NotificationsPage() {
  const { t } = useLanguage()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [category, setCategory] = useState<Category>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Notification | null>(null)

  const categoryConfig: Record<Exclude<Category, 'all'>, { icon: React.ReactNode; color: string; label: string }> = {
    academic: { icon: <GraduationCap size={15} />, color: 'bg-blue-100 text-blue-700', label: t('notif_cat_academic') },
    exam: { icon: <GraduationCap size={15} />, color: 'bg-violet-100 text-violet-700', label: t('notif_cat_exam') },
    tuition: { icon: <CreditCard size={15} />, color: 'bg-amber-100 text-amber-700', label: t('notif_cat_tuition') },
    event: { icon: <Calendar size={15} />, color: 'bg-emerald-100 text-emerald-700', label: t('notif_cat_event') },
    security: { icon: <Shield size={15} />, color: 'bg-red-100 text-red-700', label: t('notif_cat_security') },
  }

  const catFilterLabel = (c: Category) => {
    if (c === 'all') return t('notif_cat_all')
    return categoryConfig[c].label
  }

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })))
  const markRead = (id: number) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x))

  const filtered = notifications.filter(n => {
    if (category !== 'all' && n.category !== category) return false
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('notif_title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{unreadCount} {t('notif_unread')}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <CheckCheck size={14} /> {t('notif_mark_all')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('notif_search')} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] bg-white" />
        </div>
        <div className="flex flex-wrap gap-1">
          {(['all', 'academic', 'exam', 'tuition', 'event', 'security'] as Category[]).map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${category === c ? 'bg-[#1E3A8A] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              {catFilterLabel(c)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">{t('notif_empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(n => (
              <button
                key={n.id}
                onClick={() => { setSelected(n); markRead(n.id) }}
                className={`w-full text-left flex gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${categoryConfig[n.category].color}`}>
                  {categoryConfig[n.category].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`text-sm font-semibold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {n.title}
                      {!n.read && <span className="inline-block w-2 h-2 bg-[#2563EB] rounded-full ml-2 mb-0.5" />}
                    </div>
                    <ChevronRight size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${categoryConfig[n.category].color}`}>{categoryConfig[n.category].label}</span>
                    <span className="text-xs text-gray-400">{n.time}</span>
                    {n.attachment && <span className="flex items-center gap-0.5 text-xs text-gray-400"><Paperclip size={10} />{n.attachment}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryConfig[selected.category].color}`}>
                {categoryConfig[selected.category].icon}
              </div>
              <div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${categoryConfig[selected.category].color}`}>{categoryConfig[selected.category].label}</span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{selected.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selected.time}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{selected.body}</p>
            {selected.attachment && (
              <div className="flex items-center gap-2 text-sm text-[#2563EB] bg-blue-50 rounded-lg px-3 py-2 mb-4 cursor-pointer hover:bg-blue-100">
                <Paperclip size={14} /> {selected.attachment}
              </div>
            )}
            <button onClick={() => setSelected(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm">{t('close')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
