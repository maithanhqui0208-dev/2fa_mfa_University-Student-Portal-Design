import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Download, Filter } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

const DAYS_VI = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const HOURS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

type ViewMode = 'week' | 'day' | 'month'

const classes = [
  { id: 1, code: 'CS301', name: 'Cấu trúc dữ liệu & Giải thuật', lecturer: 'TS. Phạm Văn Đức', room: 'B2-401', day: 0, startH: 7.5, dur: 1.67, color: 'bg-blue-100 border-blue-400 text-blue-900', type: 'In-person' },
  { id: 2, code: 'MA201', name: 'Xác suất thống kê', lecturer: 'TS. Lê Thị Hoa', room: 'A1-202', day: 0, startH: 9.5, dur: 1.67, color: 'bg-violet-100 border-violet-400 text-violet-900', type: 'In-person' },
  { id: 3, code: 'CS401', name: 'Học máy', lecturer: 'GS. Nguyễn Minh Trí', room: 'Online', day: 0, startH: 13, dur: 1.67, color: 'bg-emerald-100 border-emerald-400 text-emerald-900', type: 'Online' },
  { id: 4, code: 'SE302', name: 'Kiến trúc phần mềm', lecturer: 'TS. Trần Quốc Bảo', room: 'C3-105', day: 1, startH: 7.5, dur: 1.67, color: 'bg-orange-100 border-orange-400 text-orange-900', type: 'In-person' },
  { id: 5, code: 'CS401', name: 'Thực hành Học máy', lecturer: 'GS. Nguyễn Minh Trí', room: 'Lab 204', day: 2, startH: 13, dur: 3, color: 'bg-emerald-100 border-emerald-400 text-emerald-900', type: 'In-person' },
  { id: 6, code: 'CS301', name: 'Cấu trúc dữ liệu & Giải thuật', lecturer: 'TS. Phạm Văn Đức', room: 'B2-401', day: 2, startH: 7.5, dur: 1.67, color: 'bg-blue-100 border-blue-400 text-blue-900', type: 'In-person' },
  { id: 7, code: 'EN301', name: 'Tiếng Anh chuyên ngành', lecturer: 'ThS. Nguyễn Thu Hà', room: 'A2-301', day: 3, startH: 9.5, dur: 1.67, color: 'bg-pink-100 border-pink-400 text-pink-900', type: 'In-person' },
  { id: 8, code: 'SE302', name: 'Kiến trúc phần mềm', lecturer: 'TS. Trần Quốc Bảo', room: 'C3-105', day: 4, startH: 13, dur: 1.67, color: 'bg-orange-100 border-orange-400 text-orange-900', type: 'In-person' },
]

const START_H = 7
const TOTAL_H = 11
const CELL_HEIGHT = 56
const weekDates = ['11/8', '12/8', '13/8', '14/8', '15/8', '16/8']

export default function SchedulePage() {
  const { t } = useLanguage()
  const [view, setView] = useState<ViewMode>('week')
  const [selectedClass, setSelectedClass] = useState<typeof classes[0] | null>(null)
  const todayIdx = 2

  const viewLabels: Record<ViewMode, string> = {
    day: t('schedule_view_day'),
    week: t('schedule_view_week'),
    month: t('schedule_view_month'),
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('schedule_title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('schedule_subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={14} /> {t('schedule_filter')}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Download size={14} /> {t('schedule_export')}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronLeft size={16} /></button>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
              <Calendar size={14} className="text-[#2563EB]" />
              Aug 11 – Aug 16, 2025
            </div>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronRight size={16} /></button>
          </div>

          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#2563EB] bg-blue-50">{t('schedule_today_btn')}</button>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(['day', 'week', 'month'] as ViewMode[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {viewLabels[v]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Week grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Day headers */}
            <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '56px repeat(6, 1fr)' }}>
              <div className="p-2" />
              {DAYS_VI.map((d, i) => (
                <div key={d} className={`p-3 text-center border-l border-gray-100 ${i === todayIdx ? 'bg-blue-50' : ''}`}>
                  <div className="text-xs text-gray-500 font-medium">{d}</div>
                  <div className={`text-sm font-bold mt-0.5 ${i === todayIdx ? 'text-[#2563EB]' : 'text-gray-700'}`}>{weekDates[i]}</div>
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div className="relative" style={{ height: TOTAL_H * CELL_HEIGHT }}>
              {HOURS.map((h, i) => (
                <div key={h} className="absolute left-0 right-0 flex" style={{ top: i * CELL_HEIGHT }}>
                  <div className="w-14 text-right pr-2 text-xs text-gray-400 -translate-y-2">{h}</div>
                  <div className="flex-1 border-t border-gray-100" />
                </div>
              ))}

              {DAYS_VI.map((_, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`absolute border-l border-gray-100 ${dayIdx === todayIdx ? 'bg-blue-50/40' : ''}`}
                  style={{
                    left: `calc(56px + ${dayIdx} * ((100% - 56px) / 6))`,
                    width: `calc((100% - 56px) / 6)`,
                    top: 0,
                    bottom: 0,
                  }}
                />
              ))}

              {classes.map(cls => {
                const top = (cls.startH - START_H) * CELL_HEIGHT
                const height = cls.dur * CELL_HEIGHT - 4
                const colW = `calc((100% - 56px) / 6)`
                const left = `calc(56px + ${cls.day} * ${colW} + 2px)`
                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`absolute rounded-lg border-l-4 px-2 py-1.5 text-left transition-all hover:opacity-90 hover:shadow-md cursor-pointer ${cls.color}`}
                    style={{ top, height, left, width: `calc(${colW} - 4px)` }}
                  >
                    <div className="text-xs font-bold truncate">{cls.code}</div>
                    <div className="text-xs truncate opacity-80">{cls.name}</div>
                    <div className="text-xs opacity-60 mt-0.5">{cls.room}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Class detail modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedClass(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold mb-3 ${selectedClass.color}`}>{selectedClass.code}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">{selectedClass.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700 w-24">{t('schedule_modal_lecturer')}</span>{selectedClass.lecturer}</div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700 w-24">{t('schedule_modal_room')}</span>{selectedClass.room}</div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700 w-24">{t('schedule_modal_day')}</span>{DAYS_VI[selectedClass.day]}, {weekDates[selectedClass.day]}</div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700 w-24">{t('schedule_modal_time')}</span>{selectedClass.startH}:00 – {(selectedClass.startH + selectedClass.dur).toFixed(0)}:40</div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700 w-24">{t('schedule_modal_format')}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedClass.type === 'Online' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {selectedClass.type === 'Online' ? t('online') : t('in_person')}
                </span>
              </div>
            </div>
            <button onClick={() => setSelectedClass(null)} className="mt-5 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm transition-colors">{t('schedule_close')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
