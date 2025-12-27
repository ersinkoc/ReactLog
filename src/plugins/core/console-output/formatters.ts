import type {
  MountEvent,
  UnmountEvent,
  UpdateEvent,
  PropsChangeEvent,
  StateChangeEvent,
  EffectRunEvent,
  EffectCleanupEvent,
  ContextChangeEvent,
  ErrorEvent,
} from '../../../types'
import { formatValue, formatDuration } from '../../../utils'

/**
 * Console style constants
 */
export const CONSOLE_STYLES = {
  // Event icons
  icons: {
    mount: '\u2B06\uFE0F',
    unmount: '\u2B07\uFE0F',
    update: '\uD83D\uDD03',
    props: '\uD83D\uDCE6',
    state: '\uD83D\uDCCA',
    effectRun: '\uD83D\uDD04',
    effectCleanup: '\uD83E\uDDF9',
    context: '\uD83C\uDF10',
    error: '\u274C',
    time: '\u23F1\uFE0F',
  },

  // CSS styles for console
  componentName: 'color: #61dafb; font-weight: bold',
  timestamp: 'color: #888; font-size: 0.9em',
  mount: 'color: #4caf50; font-weight: bold',
  unmount: 'color: #f44336; font-weight: bold',
  update: 'color: #2196f3; font-weight: bold',
  props: 'color: #ff9800',
  state: 'color: #9c27b0',
  effect: 'color: #00bcd4',
  context: 'color: #8bc34a',
  error: 'color: #f44336; font-weight: bold',
  changed: 'color: #ff5722',
  unchanged: 'color: #888',
  label: 'color: #aaa',
  value: 'color: #fff',
} as const

/**
 * Format mount event for console
 */
export function formatMountEvent(event: MountEvent): { message: string; args: unknown[] } {
  const icon = CONSOLE_STYLES.icons.mount
  const propCount = Object.keys(event.props).length
  const stateCount = Object.keys(event.initialState).length

  let details = ''
  if (propCount > 0) {
    details += ` | ${propCount} props`
  }
  if (stateCount > 0) {
    details += ` | ${stateCount} state hooks`
  }

  return {
    message: `%c${icon} MOUNT%c ${event.componentName}${details}`,
    args: [CONSOLE_STYLES.mount, CONSOLE_STYLES.componentName],
  }
}

/**
 * Format unmount event for console
 */
export function formatUnmountEvent(event: UnmountEvent): { message: string; args: unknown[] } {
  const icon = CONSOLE_STYLES.icons.unmount
  const lifetime = formatDuration(event.lifetime)

  return {
    message: `%c${icon} UNMOUNT%c ${event.componentName} %c(lifetime: ${lifetime})`,
    args: [CONSOLE_STYLES.unmount, CONSOLE_STYLES.componentName, CONSOLE_STYLES.timestamp],
  }
}

/**
 * Format update event for console
 */
export function formatUpdateEvent(event: UpdateEvent): { message: string; args: unknown[] } {
  const icon = CONSOLE_STYLES.icons.update

  return {
    message: `%c${icon} UPDATE%c ${event.componentName} %c(${event.reason}, render #${event.renderCount})`,
    args: [CONSOLE_STYLES.update, CONSOLE_STYLES.componentName, CONSOLE_STYLES.timestamp],
  }
}

/**
 * Format props change event for console
 */
export function formatPropsChangeEvent(event: PropsChangeEvent): {
  message: string
  args: unknown[]
  details: { message: string; args: unknown[] }[]
} {
  const icon = CONSOLE_STYLES.icons.props
  const changeCount = event.changes.length

  const details = event.changes.map((change) => {
    const prevStr = formatValue(change.prevValue)
    const nextStr = formatValue(change.nextValue)
    return {
      message: `  %c${change.key}:%c ${prevStr} %c\u2192%c ${nextStr}`,
      args: [CONSOLE_STYLES.label, CONSOLE_STYLES.unchanged, CONSOLE_STYLES.changed, CONSOLE_STYLES.value],
    }
  })

  return {
    message: `%c${icon} PROPS%c ${event.componentName} %c(${changeCount} change${changeCount !== 1 ? 's' : ''})`,
    args: [CONSOLE_STYLES.props, CONSOLE_STYLES.componentName, CONSOLE_STYLES.timestamp],
    details,
  }
}

/**
 * Format state change event for console
 */
export function formatStateChangeEvent(event: StateChangeEvent): { message: string; args: unknown[] } {
  const icon = CONSOLE_STYLES.icons.state
  const prevStr = formatValue(event.prevState)
  const nextStr = formatValue(event.nextState)

  return {
    message: `%c${icon} STATE%c ${event.componentName} %c[${event.hookIndex}]%c ${prevStr} \u2192 ${nextStr}`,
    args: [
      CONSOLE_STYLES.state,
      CONSOLE_STYLES.componentName,
      CONSOLE_STYLES.label,
      CONSOLE_STYLES.value,
    ],
  }
}

/**
 * Format effect run event for console
 */
export function formatEffectRunEvent(event: EffectRunEvent): { message: string; args: unknown[] } {
  const icon = CONSOLE_STYLES.icons.effectRun
  const isMount = event.dependenciesChanged.length === 0 && event.dependencies.length >= 0

  let reason = 'mount'
  if (!isMount && event.dependenciesChanged.length > 0) {
    reason = `deps changed: [${event.dependenciesChanged.join(', ')}]`
  }

  return {
    message: `%c${icon} EFFECT RUN%c ${event.componentName} %c[${event.effectIndex}] (${reason})`,
    args: [CONSOLE_STYLES.effect, CONSOLE_STYLES.componentName, CONSOLE_STYLES.timestamp],
  }
}

/**
 * Format effect cleanup event for console
 */
export function formatEffectCleanupEvent(event: EffectCleanupEvent): {
  message: string
  args: unknown[]
} {
  const icon = CONSOLE_STYLES.icons.effectCleanup

  return {
    message: `%c${icon} EFFECT CLEANUP%c ${event.componentName} %c[${event.effectIndex}] (${event.reason})`,
    args: [CONSOLE_STYLES.effect, CONSOLE_STYLES.componentName, CONSOLE_STYLES.timestamp],
  }
}

/**
 * Format context change event for console
 */
export function formatContextChangeEvent(event: ContextChangeEvent): {
  message: string
  args: unknown[]
} {
  const icon = CONSOLE_STYLES.icons.context
  const prevStr = formatValue(event.prevValue)
  const nextStr = formatValue(event.nextValue)

  return {
    message: `%c${icon} CONTEXT%c ${event.componentName} %c${event.contextName}:%c ${prevStr} \u2192 ${nextStr}`,
    args: [
      CONSOLE_STYLES.context,
      CONSOLE_STYLES.componentName,
      CONSOLE_STYLES.label,
      CONSOLE_STYLES.value,
    ],
  }
}

/**
 * Format error event for console
 */
export function formatErrorEvent(event: ErrorEvent): { message: string; args: unknown[] } {
  const icon = CONSOLE_STYLES.icons.error
  const recoveredText = event.recovered ? ' (recovered)' : ''

  return {
    message: `%c${icon} ERROR%c ${event.componentName}%c: ${event.error.message}${recoveredText}`,
    args: [CONSOLE_STYLES.error, CONSOLE_STYLES.componentName, CONSOLE_STYLES.value],
  }
}

/**
 * Format timestamp for console header
 */
export function formatTimestampForConsole(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const ms = date.getMilliseconds().toString().padStart(3, '0')
  return `${hours}:${minutes}:${seconds}.${ms}`
}
