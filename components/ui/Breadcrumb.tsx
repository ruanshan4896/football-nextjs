import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  name: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-500 ${className}`} aria-label="Breadcrumb">
      <Link 
        href="/" 
        className="flex items-center hover:text-green-600 transition-colors"
        aria-label="Trang chủ"
      >
        <Home size={14} />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight size={14} className="text-gray-300" />
          {item.href && index < items.length - 1 ? (
            <Link 
              href={item.href} 
              className="hover:text-green-600 transition-colors truncate max-w-[200px]"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium truncate max-w-[200px]" aria-current="page">
              {item.name}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}