'use client'

import { ChevronDownIcon } from '@/components/ui'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  size?: 'sm' | 'md'
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  size = 'md'
}: SelectProps) {
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm h-8',
    md: 'px-3 py-2 text-base h-10'
  }

  return (
    <div className={`relative ${className}`}>
      <ChevronDownIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full pl-8 pr-3 border border-gray-300 rounded-md bg-white text-gray-900 
          appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          flex items-center
          ${sizeStyles[size]}
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}