import { useState, useEffect, useCallback } from 'react'
import type { ComponentMetrics, LogEntry } from '../../types'
import { useOptionalLogContext } from '../context'

/**
 * useLogMetrics hook for getting metrics about a component
 *
 * @param componentName - Name of the component to get metrics for
 * @returns Component metrics
 */
export function useLogMetrics(componentName: string): ComponentMetrics | null {
  const kernel = useOptionalLogContext()
  const [metrics, setMetrics] = useState<ComponentMetrics | null>(null)

  const updateMetrics = useCallback(() => {
    if (!kernel) return

    const logs = kernel.getLogs()
    const componentLogs: LogEntry[] = []

    // Find logs for this component name
    for (const entry of logs.entries) {
      if (entry.componentName === componentName) {
        componentLogs.push(entry)
      }
    }

    if (componentLogs.length === 0) {
      setMetrics(null)
      return
    }

    // Extract metrics from logs
    let mountTime: number | null = null
    let unmountTime: number | null = null
    let updateCount = 0
    let renderCount = 0
    let lastUpdate: number | null = null
    let componentId = ''
    let isCurrentlyMounted = false

    for (const log of componentLogs) {
      componentId = log.componentId

      switch (log.event.type) {
        case 'mount':
          mountTime = log.timestamp
          isCurrentlyMounted = true
          renderCount++
          break
        case 'unmount':
          unmountTime = log.timestamp
          isCurrentlyMounted = false
          break
        case 'update':
          updateCount++
          renderCount++
          lastUpdate = log.timestamp
          break
      }
    }

    const lifetime = mountTime
      ? isCurrentlyMounted
        ? Date.now() - mountTime
        : unmountTime
          ? unmountTime - mountTime
          : null
      : null

    setMetrics({
      componentId,
      componentName,
      mountTime,
      unmountTime,
      lifetime,
      updateCount,
      renderCount,
      lastUpdate,
      isCurrentlyMounted,
    })
  }, [kernel, componentName])

  // Update metrics on mount and when logs change
  useEffect(() => {
    if (!kernel) return

    updateMetrics()

    // Subscribe to log updates
    const unsubscribe = kernel.onLog(() => {
      updateMetrics()
    })

    return unsubscribe
  }, [kernel, updateMetrics])

  return metrics
}

/**
 * useAllMetrics hook for getting metrics about all tracked components
 *
 * @returns Array of component metrics
 */
export function useAllMetrics(): ComponentMetrics[] {
  const kernel = useOptionalLogContext()
  const [allMetrics, setAllMetrics] = useState<ComponentMetrics[]>([])

  const updateAllMetrics = useCallback(() => {
    if (!kernel) return

    const logs = kernel.getLogs()
    const componentMap = new Map<string, {
      componentId: string
      componentName: string
      mountTime: number | null
      unmountTime: number | null
      updateCount: number
      renderCount: number
      lastUpdate: number | null
      isCurrentlyMounted: boolean
    }>()

    for (const entry of logs.entries) {
      let data = componentMap.get(entry.componentId)
      if (!data) {
        data = {
          componentId: entry.componentId,
          componentName: entry.componentName,
          mountTime: null,
          unmountTime: null,
          updateCount: 0,
          renderCount: 0,
          lastUpdate: null,
          isCurrentlyMounted: false,
        }
        componentMap.set(entry.componentId, data)
      }

      switch (entry.event.type) {
        case 'mount':
          data.mountTime = entry.timestamp
          data.isCurrentlyMounted = true
          data.renderCount++
          break
        case 'unmount':
          data.unmountTime = entry.timestamp
          data.isCurrentlyMounted = false
          break
        case 'update':
          data.updateCount++
          data.renderCount++
          data.lastUpdate = entry.timestamp
          break
      }
    }

    const metrics: ComponentMetrics[] = []
    for (const data of componentMap.values()) {
      const lifetime = data.mountTime
        ? data.isCurrentlyMounted
          ? Date.now() - data.mountTime
          : data.unmountTime
            ? data.unmountTime - data.mountTime
            : null
        : null

      metrics.push({
        ...data,
        lifetime,
      })
    }

    setAllMetrics(metrics)
  }, [kernel])

  useEffect(() => {
    if (!kernel) return

    updateAllMetrics()

    const unsubscribe = kernel.onLog(() => {
      updateAllMetrics()
    })

    return unsubscribe
  }, [kernel, updateAllMetrics])

  return allMetrics
}
