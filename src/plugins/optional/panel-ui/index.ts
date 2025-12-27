import type {
  Plugin,
  Kernel,
  LogEntry,
  PanelUIOptions,
  PanelUIAPI,
} from '../../../types'

/**
 * Default options for panel UI
 */
const DEFAULT_OPTIONS: PanelUIOptions = {
  position: 'bottom-right',
  shortcut: 'ctrl+shift+l',
  draggable: true,
  resizable: true,
  defaultWidth: 400,
  defaultHeight: 300,
  defaultCollapsed: false,
  theme: 'dark',
  maxLogs: 500,
}

/**
 * Panel state
 */
interface PanelState {
  isOpen: boolean
  position: PanelUIOptions['position']
  theme: PanelUIOptions['theme']
  width: number
  height: number
  logs: LogEntry[]
  filter: string
  isPaused: boolean
}

/**
 * Creates the panel-ui plugin
 * Debug panel overlay with Shadow DOM isolation
 */
export function panelUI(
  userOptions: Partial<PanelUIOptions> = {}
): Plugin & { api: PanelUIAPI } {
  const options: PanelUIOptions = { ...DEFAULT_OPTIONS, ...userOptions }

  let kernel: Kernel | null = null
  let container: HTMLDivElement | null = null
  let shadowRoot: ShadowRoot | null = null
  let panelElement: HTMLDivElement | null = null
  let unsubscribeLog: (() => void) | null = null

  const state: PanelState = {
    isOpen: !options.defaultCollapsed,
    position: options.position,
    theme: options.theme,
    width: options.defaultWidth,
    height: options.defaultHeight,
    logs: [],
    filter: '',
    isPaused: false,
  }

  function getPositionStyles(): Record<string, string> {
    const margin = '10px'
    switch (state.position) {
      case 'top-left':
        return { top: margin, left: margin }
      case 'top-right':
        return { top: margin, right: margin }
      case 'bottom-left':
        return { bottom: margin, left: margin }
      case 'bottom-right':
      default:
        return { bottom: margin, right: margin }
    }
  }

  function getColors() {
    const isDark = state.theme === 'dark' ||
      (state.theme === 'auto' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)

    return isDark
      ? {
          bg: '#1a1a1a',
          bgSecondary: '#222',
          border: '#333',
          text: '#fff',
          textSecondary: '#888',
          accent: '#61dafb',
        }
      : {
          bg: '#fff',
          bgSecondary: '#f5f5f5',
          border: '#ddd',
          text: '#333',
          textSecondary: '#666',
          accent: '#0066cc',
        }
  }

  function getStyles(): string {
    const colors = getColors()

    return `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .reactlog-panel {
        position: fixed;
        background: ${colors.bg};
        border: 1px solid ${colors.border};
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
        font-size: 12px;
        color: ${colors.text};
        z-index: 99999;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        flex-direction: column;
      }
      .reactlog-header {
        padding: 8px 12px;
        background: ${colors.bgSecondary};
        border-bottom: 1px solid ${colors.border};
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;
      }
      .reactlog-title { color: ${colors.accent}; font-weight: bold; font-size: 13px; }
      .reactlog-controls { display: flex; gap: 8px; align-items: center; }
      .reactlog-btn {
        background: none;
        border: 1px solid ${colors.border};
        color: ${colors.textSecondary};
        padding: 2px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
      }
      .reactlog-btn:hover { background: ${colors.border}; color: ${colors.text}; }
      .reactlog-content { flex: 1; overflow-y: auto; padding: 8px; }
      .reactlog-empty { color: ${colors.textSecondary}; text-align: center; padding: 40px 20px; }
      .reactlog-entry {
        padding: 4px 8px;
        border-bottom: 1px solid ${colors.border};
        font-size: 11px;
      }
      .reactlog-entry:hover { background: ${colors.bgSecondary}; }
      .reactlog-time { color: ${colors.textSecondary}; margin-right: 8px; }
      .reactlog-component { color: ${colors.accent}; font-weight: 500; margin-right: 8px; }
      .reactlog-event { font-weight: 500; }
      .reactlog-event-mount { color: #4caf50; }
      .reactlog-event-unmount { color: #f44336; }
      .reactlog-event-update { color: #2196f3; }
      .reactlog-event-props-change { color: #ff9800; }
      .reactlog-event-state-change { color: #9c27b0; }
      .reactlog-event-effect-run { color: #00bcd4; }
      .reactlog-event-effect-cleanup { color: #00bcd4; }
      .reactlog-event-error { color: #f44336; }
      .reactlog-footer {
        padding: 6px 12px;
        background: ${colors.bgSecondary};
        border-top: 1px solid ${colors.border};
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 10px;
        color: ${colors.textSecondary};
      }
      .reactlog-filter {
        flex: 1;
        background: ${colors.bg};
        border: 1px solid ${colors.border};
        color: ${colors.text};
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        margin-right: 8px;
      }
      .reactlog-filter:focus { outline: none; border-color: ${colors.accent}; }
    `
  }

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  function formatElapsedTime(startTime: number): string {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    textContent?: string
  ): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag)
    if (className) el.className = className
    if (textContent) el.textContent = textContent
    return el
  }

  function createLogEntry(log: LogEntry): HTMLDivElement {
    const entry = createElement('div', 'reactlog-entry')

    const time = createElement('span', 'reactlog-time', formatTime(log.timestamp))
    const component = createElement('span', 'reactlog-component', log.componentName)
    const event = createElement('span', `reactlog-event reactlog-event-${log.event.type}`, log.event.type)

    entry.appendChild(time)
    entry.appendChild(component)
    entry.appendChild(event)

    return entry
  }

  function renderPanel(): void {
    if (!panelElement || !state.isOpen) return

    // Clear panel
    while (panelElement.firstChild) {
      panelElement.removeChild(panelElement.firstChild)
    }

    const posStyles = getPositionStyles()

    // Create panel container
    const panel = createElement('div', 'reactlog-panel')
    panel.style.width = `${state.width}px`
    panel.style.height = `${state.height}px`
    Object.entries(posStyles).forEach(([key, value]) => {
      panel.style.setProperty(key, value)
    })

    // Header
    const header = createElement('div', 'reactlog-header')
    if (options.draggable) header.style.cursor = 'move'

    const title = createElement('span', 'reactlog-title', 'ReactLog')

    const controls = createElement('div', 'reactlog-controls')

    const logCount = createElement('span', undefined, `${state.logs.length} logs`)
    logCount.style.color = '#888'
    logCount.style.fontSize = '10px'

    const clearBtn = createElement('button', 'reactlog-btn', 'Clear')
    clearBtn.addEventListener('click', () => {
      kernel?.clearLogs()
      state.logs = []
      renderPanel()
    })

    const pauseBtn = createElement('button', 'reactlog-btn', state.isPaused ? '\u25B6' : '\u23F8')
    pauseBtn.addEventListener('click', () => {
      state.isPaused = !state.isPaused
      renderPanel()
    })

    const toggleBtn = createElement('button', 'reactlog-btn', '\u2212')
    toggleBtn.addEventListener('click', () => {
      state.isOpen = false
      renderCollapsed()
    })

    controls.appendChild(logCount)
    controls.appendChild(clearBtn)
    controls.appendChild(pauseBtn)
    controls.appendChild(toggleBtn)

    header.appendChild(title)
    header.appendChild(controls)

    // Content
    const content = createElement('div', 'reactlog-content')

    const filteredLogs = state.logs.filter((log) => {
      if (state.filter) {
        const searchLower = state.filter.toLowerCase()
        return log.componentName.toLowerCase().includes(searchLower) ||
               log.event.type.toLowerCase().includes(searchLower)
      }
      return true
    })

    if (filteredLogs.length === 0) {
      const empty = createElement('div', 'reactlog-empty', 'No logs yet')
      content.appendChild(empty)
    } else {
      filteredLogs.slice(-options.maxLogs).forEach((log) => {
        content.appendChild(createLogEntry(log))
      })
    }

    // Footer
    const footer = createElement('div', 'reactlog-footer')

    const filterInput = createElement('input', 'reactlog-filter') as HTMLInputElement
    filterInput.type = 'text'
    filterInput.placeholder = 'Filter...'
    filterInput.value = state.filter
    filterInput.addEventListener('input', (e) => {
      state.filter = (e.target as HTMLInputElement).value
      renderPanel()
    })

    const elapsed = createElement('span', undefined, formatElapsedTime(kernel?.getLogs().startTime ?? Date.now()))

    footer.appendChild(filterInput)
    footer.appendChild(elapsed)

    // Assemble panel
    panel.appendChild(header)
    panel.appendChild(content)
    panel.appendChild(footer)
    panelElement.appendChild(panel)

    // Scroll to bottom
    content.scrollTop = content.scrollHeight
  }

  function renderCollapsed(): void {
    if (!panelElement) return

    // Clear panel
    while (panelElement.firstChild) {
      panelElement.removeChild(panelElement.firstChild)
    }

    const posStyles = getPositionStyles()

    const panel = createElement('div', 'reactlog-panel')
    panel.style.width = `${state.width}px`
    panel.style.height = 'auto'
    Object.entries(posStyles).forEach(([key, value]) => {
      panel.style.setProperty(key, value)
    })

    const header = createElement('div', 'reactlog-header')
    header.style.cursor = 'pointer'
    header.addEventListener('click', () => {
      state.isOpen = true
      renderPanel()
    })

    const title = createElement('span', 'reactlog-title', 'ReactLog')

    const controls = createElement('div', 'reactlog-controls')

    const logCount = createElement('span', undefined, String(state.logs.length))
    logCount.style.color = '#888'
    logCount.style.fontSize = '10px'

    const arrow = createElement('span', undefined, '\u25B6')
    arrow.style.color = '#888'

    controls.appendChild(logCount)
    controls.appendChild(arrow)

    header.appendChild(title)
    header.appendChild(controls)
    panel.appendChild(header)
    panelElement.appendChild(panel)
  }

  function createPanel(): void {
    if (typeof document === 'undefined') return

    container = document.createElement('div')
    container.id = 'reactlog-panel-container'
    document.body.appendChild(container)

    shadowRoot = container.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = getStyles()
    shadowRoot.appendChild(style)

    panelElement = document.createElement('div')
    shadowRoot.appendChild(panelElement)

    if (state.isOpen) {
      renderPanel()
    } else {
      renderCollapsed()
    }
  }

  function destroyPanel(): void {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    container = null
    shadowRoot = null
    panelElement = null
  }

  function handleKeydown(e: KeyboardEvent): void {
    const parts = options.shortcut.toLowerCase().split('+')
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
      state.isOpen = !state.isOpen
      if (state.isOpen) {
        renderPanel()
      } else {
        renderCollapsed()
      }
    }
  }

  const api: PanelUIAPI = {
    open(): void {
      state.isOpen = true
      renderPanel()
    },

    close(): void {
      state.isOpen = false
      renderCollapsed()
    },

    toggle(): void {
      state.isOpen = !state.isOpen
      if (state.isOpen) {
        renderPanel()
      } else {
        renderCollapsed()
      }
    },

    isOpen(): boolean {
      return state.isOpen
    },

    setPosition(position: PanelUIOptions['position']): void {
      state.position = position
      if (state.isOpen) {
        renderPanel()
      } else {
        renderCollapsed()
      }
    },

    setTheme(theme: PanelUIOptions['theme']): void {
      state.theme = theme
      if (shadowRoot) {
        const style = shadowRoot.querySelector('style')
        if (style) {
          style.textContent = getStyles()
        }
      }
    },
  }

  const plugin: Plugin = {
    name: 'panel-ui',
    version: '1.0.0',
    type: 'optional',

    install(k: Kernel): void {
      kernel = k

      // Get existing logs
      const logStore = kernel.getLogs()
      state.logs = [...logStore.entries]

      // Subscribe to new logs
      unsubscribeLog = kernel.onLog((entry) => {
        if (!state.isPaused) {
          state.logs.push(entry)
          if (state.logs.length > options.maxLogs * 2) {
            state.logs = state.logs.slice(-options.maxLogs)
          }
          if (state.isOpen) {
            renderPanel()
          }
        }
      })

      // Create panel
      if (typeof document !== 'undefined') {
        createPanel()
        document.addEventListener('keydown', handleKeydown)
      }
    },

    uninstall(): void {
      if (unsubscribeLog) {
        unsubscribeLog()
        unsubscribeLog = null
      }

      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleKeydown)
        destroyPanel()
      }

      kernel = null
      state.logs = []
    },

    api: api as unknown as Record<string, unknown>,
  }

  return plugin as Plugin & { api: PanelUIAPI }
}
