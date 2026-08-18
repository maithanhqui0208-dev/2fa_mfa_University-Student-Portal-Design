import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, BookOpen, GraduationCap, ClipboardList,
  Bell, User, Settings, LogOut, ChevronLeft, ChevronRight,
  Search, Menu, Shield, ChevronDown, X, AlertTriangle
} from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import type { TKey } from '../i18n/translations'
import { studentProfile } from '../data/student'

type NavItem = { to: string; icon: React.FC<{ size?: number; className?: string }>; labelKey: TKey; badge?: number }

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav_dashboard' },
  { to: '/schedule', icon: Calendar, labelKey: 'nav_schedule' },
  { to: '/grades', icon: GraduationCap, labelKey: 'nav_grades' },
  { to: '/courses', icon: BookOpen, labelKey: 'nav_courses' },
  { to: '/course-registration', icon: ClipboardList, labelKey: 'nav_registration' },
  { to: '/notifications', icon: Bell, labelKey: 'nav_notifications', badge: 4 },
  { to: '/profile', icon: User, labelKey: 'nav_profile' },
  { to: '/settings', icon: Settings, labelKey: 'nav_settings' },
]

export default function Layout() {
  const { t } = useLanguage()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [signOutConfirm, setSignOutConfirm] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const breadcrumb = (() => {
    const item = navItems.find(n => location.pathname.startsWith(n.to))
    return item ? t(item.labelKey) : t('nav_dashboard')
  })()

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-blue-800/40 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-[#063B00] rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight truncate">{t('brand_name')}</div>
            <div className="text-blue-300 text-xs truncate">{t('brand_portal')}</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, labelKey, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-[#2563EB] text-white'
                  : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? t(labelKey) : undefined}
          >
            <Icon className="flex-shrink-0" size={18} />
            {!collapsed && <span className="flex-1 truncate">{t(labelKey)}</span>}
            {!collapsed && badge && (
              <span className="bg-[#F59E0B] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {badge}
              </span>
            )}
            {collapsed && badge && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F59E0B] rounded-full" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-blue-800/40 space-y-0.5">
        <button
          onClick={() => setSignOutConfirm(true)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-red-900/30 hover:text-red-300 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>{t('nav_logout')}</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0E21A0] transition-all duration-300 flex-shrink-0 relative ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-20 bg-[#2563EB] text-white rounded-r-full p-1 shadow-md hover:bg-[#1D4ED8] transition-colors z-10"
          style={{ left: collapsed ? '52px' : '228px', transition: 'left 0.3s' }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-[#0E21A0] flex flex-col h-full z-50">
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 text-blue-300 hover:text-white">
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 flex-1 min-w-0">
            <span className="text-[#1E3A8A] font-medium flex-shrink-0">{t('breadcrumb_home')}</span>
            <ChevronRight size={14} className="flex-shrink-0" />
            <span className="text-gray-700 font-medium truncate">{breadcrumb}</span>
          </div>

          {/* Search */}
          <div className="flex-1 sm:flex-none sm:w-56 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('header_search')}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] placeholder-gray-400"
            />
          </div>

          {/* Notifications */}
          <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#F59E0B] rounded-full border-2 border-white" />
          </button>

          {/* Profile */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#0E21A0] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {studentProfile.avatarInitials}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-800 leading-tight">{studentProfile.fullName}</div>
                <div className="text-xs text-gray-500">{studentProfile.studentId}</div>
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden md:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-50">
                <NavLink to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <User size={15} /> {t('header_my_profile')}
                </NavLink>
                <NavLink to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Settings size={15} /> {t('nav_settings')}
                </NavLink>
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => { setProfileOpen(false); setSignOutConfirm(true) }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                  <LogOut size={15} /> {t('header_sign_out')}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sign out confirmation */}
      {signOutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t('signout_title')}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{t('signout_body')}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setSignOutConfirm(false)} className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-50">
                {t('cancel')}
              </button>
              <button onClick={() => navigate('/login')} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm">
                {t('signout_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
