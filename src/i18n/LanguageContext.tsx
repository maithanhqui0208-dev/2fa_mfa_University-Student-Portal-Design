import { createContext, useContext, useState } from 'react'
import { en, vi, type Lang, type TKey } from './translations'

type LanguageContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TKey) => string
}

const enDict = en as unknown as Record<string, string>
const viDict = vi as Record<string, string>

function lookup(lang: Lang, key: TKey): string {
  const dict = lang === 'vi' ? viDict : enDict
  const val = dict[key]
  if (val !== undefined && val !== '') return val
  const fallback = enDict[key]
  return fallback !== undefined && fallback !== '' ? fallback : key
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'vi',
  setLang: () => {},
  t: (key) => lookup('vi', key),
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem('uth_lang')
      if (stored === 'en') return 'en'
    } catch {}
    return 'vi'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      if (l === 'vi') localStorage.removeItem('uth_lang')
      else localStorage.setItem('uth_lang', l)
    } catch {}
  }

  const t = (key: TKey): string => lookup(lang, key)

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
