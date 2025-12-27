import type { Kernel } from '../../types'
import { lifecycleLogger } from './lifecycle-logger'
import { propsTracker } from './props-tracker'
import { stateTracker } from './state-tracker'
import { effectTracker } from './effect-tracker'
import { consoleOutput } from './console-output'

export { lifecycleLogger } from './lifecycle-logger'
export { propsTracker } from './props-tracker'
export { stateTracker } from './state-tracker'
export { effectTracker } from './effect-tracker'
export { consoleOutput, CONSOLE_STYLES } from './console-output'

/**
 * Installs all core plugins on the kernel
 *
 * @param kernel - The kernel instance
 */
export function installCorePlugins(kernel: Kernel): void {
  kernel.register(lifecycleLogger())
  kernel.register(propsTracker())
  kernel.register(stateTracker())
  kernel.register(effectTracker())
  kernel.register(consoleOutput())
}

/**
 * Creates an array of all core plugins
 *
 * @returns Array of core plugin instances
 */
export function createCorePlugins() {
  return [
    lifecycleLogger(),
    propsTracker(),
    stateTracker(),
    effectTracker(),
    consoleOutput(),
  ]
}
