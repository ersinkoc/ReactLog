import React, { useEffect, useState, useCallback } from 'react'
import type { DebugPanelProps, LogEntry, PanelUIAPI, Plugin } from '../../types'
import { useOptionalLogContext } from '../context'

/**
 * DebugPanel component for displaying logs
 *
 * Note: For full functionality, use with the panelUI plugin from '@oxog/reactlog/plugins'
 * This component provides a basic fallback UI when the plugin is not installed.
 */
export function DebugPanel({
  position = 'bottom-right',
  shortcut = 'ctrl+shift+l',
  draggable = true,
  resizable: _resizable = true,
  defaultCollapsed = false,
}: DebugPanelProps): React.ReactElement | null {
  const kernel = useOptionalLogContext()
  const [isOpen, setIsOpen] = useState(!defaultCollapsed)
  const [logs, setLogs] = useState<LogEntry[]>([])

  // Check if panelUI plugin is available
  const panelPlugin = kernel?.getPlugin<Plugin & { api: PanelUIAPI }>('panel-ui')

  // If panelUI plugin is available, delegate to it
  useEffect(() => {
    if (panelPlugin?.api) {
      if (isOpen) {
        panelPlugin.api.open()
      } else {
        panelPlugin.api.close()
      }
    }
  }, [panelPlugin, isOpen])

  // Subscribe to logs
  useEffect(() => {
    if (!kernel) return

    const updateLogs = () => {
      const logStore = kernel.getLogs()
      setLogs([...logStore.entries].slice(-100)) // Last 100 logs
    }

    updateLogs()
    const unsubscribe = kernel.onLog(updateLogs)

    return unsubscribe
  }, [kernel])

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const parts = shortcut.toLowerCase().split('+')
      const key = parts[parts.length - 1]
      const needsCtrl = parts.includes('ctrl')
      const needsShift = parts.includes('shift')
      const needsAlt = parts.includes('alt')

      if (
        e.key.toLowerCase() === key &&
        e.ctrlKey === needsCtrl &&
        e.shiftKey === needsShift &&
        e.altKey === needsAlt
      ) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcut])

  const handleClear = useCallback(() => {
    kernel?.clearLogs()
    setLogs([])
  }, [kernel])

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  if (!kernel) {
    return null
  }

  // If panelUI plugin is handling the UI, render nothing here
  if (panelPlugin?.api) {
    return null
  }

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: 10, left: 10 },
    'top-right': { top: 10, right: 10 },
    'bottom-left': { bottom: 10, left: 10 },
    'bottom-right': { bottom: 10, right: 10 },
  }

  // Basic fallback UI (full UI provided by panelUI plugin)
  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        width: isOpen ? 400 : 'auto',
        maxHeight: isOpen ? 300 : 'auto',
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#fff',
        zIndex: 99999,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: '#222',
          borderBottom: isOpen ? '1px solid #333' : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: draggable ? 'move' : 'default',
        }}
        onClick={handleToggle}
      >
        <span style={{ color: '#61dafb', fontWeight: 'bold' }}>ReactLog</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#888', fontSize: 10 }}>{logs.length} logs</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            style={{
              background: 'none',
              border: '1px solid #444',
              color: '#888',
              padding: '2px 6px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 10,
            }}
          >
            Clear
          </button>
          <span style={{ color: '#888' }}>{isOpen ? '\u25BC' : '\u25B6'}</span>
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            maxHeight: 250,
            overflowY: 'auto',
            padding: 8,
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>
              No logs yet
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '4px 0',
                  borderBottom: '1px solid #2a2a2a',
                  fontSize: 11,
                }}
              >
                <span style={{ color: '#888' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>{' '}
                <span style={{ color: '#61dafb' }}>{log.componentName}</span>{' '}
                <span style={{ color: getEventColor(log.event.type) }}>
                  {log.event.type}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function getEventColor(eventType: string): string {
  const colors: Record<string, string> = {
    mount: '#4caf50',
    unmount: '#f44336',
    update: '#2196f3',
    'props-change': '#ff9800',
    'state-change': '#9c27b0',
    'effect-run': '#00bcd4',
    'effect-cleanup': '#00bcd4',
    'context-change': '#8bc34a',
    error: '#f44336',
  }
  return colors[eventType] ?? '#fff'
}
