import { useMemo, useState } from 'react'

interface VirtualizationConfig {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export const useVirtualization = <T>(
  items: T[],
  config: VirtualizationConfig
) => {
  const [scrollTop, setScrollTop] = useState(0)
  const { itemHeight, containerHeight, overscan = 5 } = config

  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2)

    return { startIndex, endIndex, visibleCount }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index
    }))
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY: visibleRange.startIndex * itemHeight,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    }
  }
}