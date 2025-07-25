'use client'

import { ReactNode, ElementType } from 'react'

type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto-fit' | 'auto-fill'
type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type GridAlign = 'start' | 'center' | 'end' | 'stretch'
type GridJustify = 'start' | 'center' | 'end' | 'stretch'

interface ResponsiveColumns {
  base?: GridColumns
  sm?: GridColumns
  md?: GridColumns
  lg?: GridColumns
  xl?: GridColumns
}

interface GridProps {
  children: ReactNode
  cols?: GridColumns | ResponsiveColumns
  gap?: GridGap
  align?: GridAlign
  justify?: GridJustify
  className?: string
  as?: ElementType
}

interface GridItemProps {
  children: ReactNode
  colSpan?: number | 'full'
  rowSpan?: number
  colStart?: number
  colEnd?: number
  rowStart?: number
  rowEnd?: number
  className?: string
  as?: ElementType
}

const columnStyles: Record<GridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
  'auto-fit': 'grid-cols-[repeat(auto-fit,minmax(200px,1fr))]',
  'auto-fill': 'grid-cols-[repeat(auto-fill,minmax(200px,1fr))]'
}

const responsiveColumnStyles = {
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
    12: 'sm:grid-cols-12',
    'auto-fit': 'sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]',
    'auto-fill': 'sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]'
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    12: 'md:grid-cols-12',
    'auto-fit': 'md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]',
    'auto-fill': 'md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]'
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
    12: 'lg:grid-cols-12',
    'auto-fit': 'lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]',
    'auto-fill': 'lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]'
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
    12: 'xl:grid-cols-12',
    'auto-fit': 'xl:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]',
    'auto-fill': 'xl:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]'
  }
}

const gapStyles: Record<GridGap, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12'
}

const alignStyles: Record<GridAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
}

const justifyStyles: Record<GridJustify, string> = {
  start: 'justify-items-start',
  center: 'justify-items-center',
  end: 'justify-items-end',
  stretch: 'justify-items-stretch'
}

function getColumnClasses(cols: GridColumns | ResponsiveColumns): string {
  if (typeof cols === 'object') {
    const classes: string[] = []
    
    if (cols.base) classes.push(columnStyles[cols.base])
    if (cols.sm) classes.push(responsiveColumnStyles.sm[cols.sm])
    if (cols.md) classes.push(responsiveColumnStyles.md[cols.md])
    if (cols.lg) classes.push(responsiveColumnStyles.lg[cols.lg])
    if (cols.xl) classes.push(responsiveColumnStyles.xl[cols.xl])
    
    return classes.join(' ')
  }
  
  return columnStyles[cols]
}

export function Grid({
  children,
  cols = 1,
  gap = 'md',
  align = 'stretch',
  justify = 'stretch',
  className = '',
  as: Component = 'div'
}: GridProps) {
  const baseStyles = 'grid'
  const columnClasses = getColumnClasses(cols)
  const gapClasses = gapStyles[gap]
  const alignClasses = alignStyles[align]
  const justifyClasses = justifyStyles[justify]
  
  const combinedClassName = `${baseStyles} ${columnClasses} ${gapClasses} ${alignClasses} ${justifyClasses} ${className}`.trim()

  return (
    <Component className={combinedClassName}>
      {children}
    </Component>
  )
}

export function GridItem({
  children,
  colSpan,
  rowSpan,
  colStart,
  colEnd,
  rowStart,
  rowEnd,
  className = '',
  as: Component = 'div'
}: GridItemProps) {
  const classes: string[] = []
  
  if (colSpan === 'full') {
    classes.push('col-span-full')
  } else if (colSpan) {
    classes.push(`col-span-${colSpan}`)
  }
  
  if (rowSpan) classes.push(`row-span-${rowSpan}`)
  if (colStart) classes.push(`col-start-${colStart}`)
  if (colEnd) classes.push(`col-end-${colEnd}`)
  if (rowStart) classes.push(`row-start-${rowStart}`)
  if (rowEnd) classes.push(`row-end-${rowEnd}`)
  
  const combinedClassName = `${classes.join(' ')} ${className}`.trim()

  return (
    <Component className={combinedClassName}>
      {children}
    </Component>
  )
}