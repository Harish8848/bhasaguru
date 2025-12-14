"use client"

import { useEffect } from 'react'

export default function PerformanceMonitor() {
  useEffect(() => {
    // Basic performance monitoring
    const logPerformance = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          console.log('Page Load Performance:', {
            'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
            'TCP Connect': navigation.connectEnd - navigation.connectStart,
            'Server Response': navigation.responseStart - navigation.requestStart,
            'Page Load': navigation.loadEventEnd - navigation.startTime,
            'DOM Ready': navigation.domContentLoadedEventEnd - navigation.startTime,
          })
        }
      }
    }

    // Log performance on load
    if (document.readyState === 'complete') {
      logPerformance()
    } else {
      window.addEventListener('load', logPerformance)
      return () => window.removeEventListener('load', logPerformance)
    }

    // Performance observer for long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              console.log('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              })
            }
          }
        })

        observer.observe({ entryTypes: ['longtask'] })

        return () => observer.disconnect()
      } catch (e) {
        // PerformanceObserver not supported or failed
        console.log('Performance monitoring not fully supported')
      }
    }
  }, [])

  return null
}
