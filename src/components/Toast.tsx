import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

type Toast = {
  id: number
  type: ToastType
  title: string
  message?: string
}

type ToastContextType = {
  toast: (type: ToastType, title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const icons = {
  success: <CheckCircle size={16} className="text-green-500" />,
  error: <AlertCircle size={16} className="text-red-500" />,
  warning: <AlertTriangle size={16} className="text-amber-500" />,
  info: <Info size={16} className="text-blue-500" />,
}

const styles = {
  success: 'border-green-200 bg-white',
  error: 'border-red-200 bg-white',
  warning: 'border-amber-200 bg-white',
  info: 'border-blue-200 bg-white',
}

const bars = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
}

let id = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const newId = ++id
    setToasts(t => [...t, { id: newId, type, title, message }])
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== newId))
    }, 4000)
  }, [])

  const dismiss = (id: number) => setToasts(t => t.filter(x => x.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg overflow-hidden animate-[slideIn_0.2s_ease] ${styles[t.type]}`}
            style={{ animation: 'slideIn 0.2s ease' }}
          >
            <div className={`absolute bottom-0 left-0 h-0.5 ${bars[t.type]}`} style={{ animation: 'shrink 4s linear forwards', width: '100%' }} />
            <div className="flex-shrink-0 mt-0.5">{icons[t.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900">{t.title}</div>
              {t.message && <div className="text-xs text-gray-500 mt-0.5">{t.message}</div>}
            </div>
            <button onClick={() => dismiss(t.id)} className="flex-shrink-0 text-gray-300 hover:text-gray-500 mt-0.5">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
