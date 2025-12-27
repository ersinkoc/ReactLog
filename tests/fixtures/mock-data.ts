import type {
  MountEvent,
  UnmountEvent,
  UpdateEvent,
  PropsChangeEvent,
  StateChangeEvent,
  EffectRunEvent,
  EffectCleanupEvent,
  LogEntry,
} from '../../src/types'

export function createMockMountEvent(overrides: Partial<MountEvent> = {}): MountEvent {
  return {
    type: 'mount',
    componentId: 'test-component-id',
    componentName: 'TestComponent',
    timestamp: Date.now(),
    props: { foo: 'bar' },
    initialState: { count: 0 },
    ...overrides,
  }
}

export function createMockUnmountEvent(overrides: Partial<UnmountEvent> = {}): UnmountEvent {
  return {
    type: 'unmount',
    componentId: 'test-component-id',
    componentName: 'TestComponent',
    timestamp: Date.now(),
    lifetime: 5000,
    ...overrides,
  }
}

export function createMockUpdateEvent(overrides: Partial<UpdateEvent> = {}): UpdateEvent {
  return {
    type: 'update',
    componentId: 'test-component-id',
    componentName: 'TestComponent',
    timestamp: Date.now(),
    reason: 'props',
    renderCount: 2,
    ...overrides,
  }
}

export function createMockPropsChangeEvent(overrides: Partial<PropsChangeEvent> = {}): PropsChangeEvent {
  return {
    type: 'props-change',
    componentId: 'test-component-id',
    componentName: 'TestComponent',
    timestamp: Date.now(),
    changes: [
      {
        key: 'value',
        prevValue: 1,
        nextValue: 2,
        isDeepEqual: false,
      },
    ],
    ...overrides,
  }
}

export function createMockStateChangeEvent(overrides: Partial<StateChangeEvent> = {}): StateChangeEvent {
  return {
    type: 'state-change',
    componentId: 'test-component-id',
    componentName: 'TestComponent',
    timestamp: Date.now(),
    hookIndex: 0,
    hookType: 'useState',
    prevState: 0,
    nextState: 1,
    ...overrides,
  }
}

export function createMockEffectRunEvent(overrides: Partial<EffectRunEvent> = {}): EffectRunEvent {
  return {
    type: 'effect-run',
    componentId: 'test-component-id',
    componentName: 'TestComponent',
    timestamp: Date.now(),
    effectIndex: 0,
    dependencies: ['dep1', 'dep2'],
    dependenciesChanged: [],
    ...overrides,
  }
}

export function createMockEffectCleanupEvent(overrides: Partial<EffectCleanupEvent> = {}): EffectCleanupEvent {
  return {
    type: 'effect-cleanup',
    componentId: 'test-component-id',
    componentName: 'TestComponent',
    timestamp: Date.now(),
    effectIndex: 0,
    reason: 'deps-change',
    ...overrides,
  }
}

export function createMockLogEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  const event = createMockMountEvent()
  return {
    id: 'log-' + Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    componentId: event.componentId,
    componentName: event.componentName,
    event,
    level: 'debug',
    formatted: 'MOUNT TestComponent',
    ...overrides,
  }
}
