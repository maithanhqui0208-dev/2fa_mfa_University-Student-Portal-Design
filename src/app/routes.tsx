import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import VerifyPage from '../pages/auth/VerifyPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import TwoFactorPage from '../pages/auth/TwoFactorPage'
import RecoveryPage from '../pages/auth/RecoveryPage'
import DashboardPage from '../pages/DashboardPage'
import SchedulePage from '../pages/SchedulePage'
import GradesPage from '../pages/GradesPage'
import CoursesPage from '../pages/CoursesPage'
import CourseRegistrationPage from '../pages/CourseRegistrationPage'
import NotificationsPage from '../pages/NotificationsPage'
import ProfilePage from '../pages/ProfilePage'
import SettingsPage from '../pages/SettingsPage'

export const router = createBrowserRouter([
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  { path: '/verify', Component: VerifyPage },
  { path: '/forgot-password', Component: ForgotPasswordPage },
  { path: '/two-factor', Component: TwoFactorPage },
  { path: '/recovery', Component: RecoveryPage },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', Component: DashboardPage },
      { path: 'schedule', Component: SchedulePage },
      { path: 'grades', Component: GradesPage },
      { path: 'courses', Component: CoursesPage },
      { path: 'course-registration', Component: CourseRegistrationPage },
      { path: 'notifications', Component: NotificationsPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])
