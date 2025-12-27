import { describe, it, expect } from 'vitest'
import {
  CONSOLE_STYLES,
  formatMountEvent,
  formatUnmountEvent,
  formatUpdateEvent,
  formatPropsChangeEvent,
  formatStateChangeEvent,
  formatEffectRunEvent,
  formatEffectCleanupEvent,
  formatContextChangeEvent,
  formatErrorEvent,
  formatTimestampForConsole,
} from '../../../../src/plugins/core/console-output/formatters'
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
} from '../../../../src/types'

describe('CONSOLE_STYLES', () => {
  it('should have icons defined', () => {
    expect(CONSOLE_STYLES.icons).toBeDefined()
    expect(CONSOLE_STYLES.icons.mount).toBeDefined()
    expect(CONSOLE_STYLES.icons.unmount).toBeDefined()
    expect(CONSOLE_STYLES.icons.update).toBeDefined()
    expect(CONSOLE_STYLES.icons.props).toBeDefined()
    expect(CONSOLE_STYLES.icons.state).toBeDefined()
    expect(CONSOLE_STYLES.icons.effectRun).toBeDefined()
    expect(CONSOLE_STYLES.icons.effectCleanup).toBeDefined()
    expect(CONSOLE_STYLES.icons.context).toBeDefined()
    expect(CONSOLE_STYLES.icons.error).toBeDefined()
    expect(CONSOLE_STYLES.icons.time).toBeDefined()
  })

  it('should have CSS styles defined', () => {
    expect(CONSOLE_STYLES.componentName).toBeDefined()
    expect(CONSOLE_STYLES.timestamp).toBeDefined()
    expect(CONSOLE_STYLES.mount).toBeDefined()
    expect(CONSOLE_STYLES.unmount).toBeDefined()
    expect(CONSOLE_STYLES.update).toBeDefined()
    expect(CONSOLE_STYLES.props).toBeDefined()
    expect(CONSOLE_STYLES.state).toBeDefined()
    expect(CONSOLE_STYLES.effect).toBeDefined()
    expect(CONSOLE_STYLES.context).toBeDefined()
    expect(CONSOLE_STYLES.error).toBeDefined()
  })
})

describe('formatMountEvent', () => {
  it('should format mount event with props and state', () => {
    const event: MountEvent = {
      type: 'mount',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      props: { foo: 'bar', count: 42 },
      initialState: { value: 0, name: 'test' },
    }

    const result = formatMountEvent(event)
    expect(result.message).toContain('MOUNT')
    expect(result.message).toContain('TestComponent')
    expect(result.message).toContain('2 props')
    expect(result.message).toContain('2 state hooks')
    expect(result.args).toHaveLength(2)
  })

  it('should format mount event without props', () => {
    const event: MountEvent = {
      type: 'mount',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      props: {},
      initialState: { value: 0 },
    }

    const result = formatMountEvent(event)
    expect(result.message).not.toContain('props')
    expect(result.message).toContain('1 state hooks')
  })

  it('should format mount event without state', () => {
    const event: MountEvent = {
      type: 'mount',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      props: { foo: 'bar' },
      initialState: {},
    }

    const result = formatMountEvent(event)
    expect(result.message).toContain('1 props')
    expect(result.message).not.toContain('state hooks')
  })
})

describe('formatUnmountEvent', () => {
  it('should format unmount event', () => {
    const event: UnmountEvent = {
      type: 'unmount',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      lifetime: 5000,
    }

    const result = formatUnmountEvent(event)
    expect(result.message).toContain('UNMOUNT')
    expect(result.message).toContain('TestComponent')
    expect(result.message).toContain('lifetime')
    expect(result.args).toHaveLength(3)
  })
})

describe('formatUpdateEvent', () => {
  it('should format update event', () => {
    const event: UpdateEvent = {
      type: 'update',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      renderCount: 5,
      reason: 'props-change',
    }

    const result = formatUpdateEvent(event)
    expect(result.message).toContain('UPDATE')
    expect(result.message).toContain('TestComponent')
    expect(result.message).toContain('props-change')
    expect(result.message).toContain('render #5')
    expect(result.args).toHaveLength(3)
  })
})

describe('formatPropsChangeEvent', () => {
  it('should format props change event', () => {
    const event: PropsChangeEvent = {
      type: 'props-change',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      changes: [
        { key: 'foo', prevValue: 'bar', nextValue: 'baz', isDeepEqual: false },
        { key: 'count', prevValue: 1, nextValue: 2, isDeepEqual: false },
      ],
    }

    const result = formatPropsChangeEvent(event)
    expect(result.message).toContain('PROPS')
    expect(result.message).toContain('TestComponent')
    expect(result.message).toContain('2 changes')
    expect(result.args).toHaveLength(3)
    expect(result.details).toHaveLength(2)
    expect(result.details[0].message).toContain('foo')
    expect(result.details[1].message).toContain('count')
  })

  it('should use singular "change" for single change', () => {
    const event: PropsChangeEvent = {
      type: 'props-change',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      changes: [{ key: 'foo', prevValue: 'bar', nextValue: 'baz', isDeepEqual: false }],
    }

    const result = formatPropsChangeEvent(event)
    expect(result.message).toContain('1 change)')
    expect(result.message).not.toContain('changes')
  })
})

describe('formatStateChangeEvent', () => {
  it('should format state change event', () => {
    const event: StateChangeEvent = {
      type: 'state-change',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      hookIndex: 0,
      hookType: 'useState',
      prevState: 0,
      nextState: 1,
    }

    const result = formatStateChangeEvent(event)
    expect(result.message).toContain('STATE')
    expect(result.message).toContain('TestComponent')
    expect(result.message).toContain('[0]')
    expect(result.message).toContain('\u2192') // Arrow
    expect(result.args).toHaveLength(4)
  })
})

describe('formatEffectRunEvent', () => {
  it('should format effect run event on mount', () => {
    const event: EffectRunEvent = {
      type: 'effect-run',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      effectIndex: 0,
      dependencies: [1, 2, 3],
      dependenciesChanged: [],
    }

    const result = formatEffectRunEvent(event)
    expect(result.message).toContain('EFFECT RUN')
    expect(result.message).toContain('TestComponent')
    expect(result.message).toContain('[0]')
    expect(result.message).toContain('mount')
    expect(result.args).toHaveLength(3)
  })

  it('should format effect run event with deps changed', () => {
    const event: EffectRunEvent = {
      type: 'effect-run',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      effectIndex: 1,
      dependencies: [1, 2, 3],
      dependenciesChanged: [0, 2],
    }

    const result = formatEffectRunEvent(event)
    expect(result.message).toContain('deps changed')
    expect(result.message).toContain('0, 2')
  })
})

describe('formatEffectCleanupEvent', () => {
  it('should format effect cleanup event', () => {
    const event: EffectCleanupEvent = {
      type: 'effect-cleanup',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      effectIndex: 0,
      reason: 'unmount',
    }

    const result = formatEffectCleanupEvent(event)
    expect(result.message).toContain('EFFECT CLEANUP')
    expect(result.message).toContain('TestComponent')
    expect(result.message).toContain('[0]')
    expect(result.message).toContain('unmount')
    expect(result.args).toHaveLength(3)
  })
})

describe('formatContextChangeEvent', () => {
  it('should format context change event', () => {
    const event: ContextChangeEvent = {
      type: 'context-change',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      contextName: 'ThemeContext',
      prevValue: 'light',
      nextValue: 'dark',
    }

    const result = formatContextChangeEvent(event)
    expect(result.message).toContain('CONTEXT')
    expect(result.message).toContain('TestComponent')
    expect(result.message).toContain('ThemeContext')
    expect(result.message).toContain('\u2192') // Arrow
    expect(result.args).toHaveLength(4)
  })
})

describe('formatErrorEvent', () => {
  it('should format error event', () => {
    const event: ErrorEvent = {
      type: 'error',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      error: new Error('Something went wrong'),
      errorInfo: { componentStack: '' },
      recovered: false,
    }

    const result = formatErrorEvent(event)
    expect(result.message).toContain('ERROR')
    expect(result.message).toContain('TestComponent')
    expect(result.message).toContain('Something went wrong')
    expect(result.message).not.toContain('recovered')
    expect(result.args).toHaveLength(3)
  })

  it('should show recovered status', () => {
    const event: ErrorEvent = {
      type: 'error',
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      error: new Error('Handled error'),
      errorInfo: { componentStack: '' },
      recovered: true,
    }

    const result = formatErrorEvent(event)
    expect(result.message).toContain('(recovered)')
  })
})

describe('formatTimestampForConsole', () => {
  it('should format timestamp correctly', () => {
    // Create a specific date: 2024-01-15 10:30:45.123
    const date = new Date(2024, 0, 15, 10, 30, 45, 123)
    const timestamp = date.getTime()

    const result = formatTimestampForConsole(timestamp)
    expect(result).toBe('10:30:45.123')
  })

  it('should pad single digit values', () => {
    // Create a date: 2024-01-01 01:02:03.004
    const date = new Date(2024, 0, 1, 1, 2, 3, 4)
    const timestamp = date.getTime()

    const result = formatTimestampForConsole(timestamp)
    expect(result).toBe('01:02:03.004')
  })

  it('should handle midnight', () => {
    const date = new Date(2024, 0, 1, 0, 0, 0, 0)
    const timestamp = date.getTime()

    const result = formatTimestampForConsole(timestamp)
    expect(result).toBe('00:00:00.000')
  })
})
