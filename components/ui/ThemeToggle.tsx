'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={20} />
      case 'dark':
        return <Moon size={20} />
      case 'system':
        return <Monitor size={20} />
      default:
        return <Sun size={20} />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Chế độ sáng'
      case 'dark':
        return 'Chế độ tối'
      case 'system':
        return 'Theo hệ thống'
      default:
        return 'Chế độ sáng'
    }
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={getLabel()}
      className="rounded-full p-2 hover:bg-green-600 dark:hover:bg-green-600 transition-colors"
      title={getLabel()}
    >
      {getIcon()}
    </button>
  )
}