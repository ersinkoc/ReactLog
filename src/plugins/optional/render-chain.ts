import type {
  Plugin,
  Kernel,
  MountEvent,
  UpdateEvent,
  RenderChainOptions,
  RenderChainAPI,
  RenderChainNode,
} from '../../types'

/**
 * Default options for render chain
 */
const DEFAULT_OPTIONS: RenderChainOptions = {
  maxDepth: 10,
}

/**
 * Time window to consider renders as part of the same chain (ms)
 */
const CHAIN_WINDOW = 50

/**
 * Creates the render-chain plugin
 * Tracks parent→child render propagation
 */
export function renderChain(
  userOptions: Partial<RenderChainOptions> = {}
): Plugin & { api: RenderChainAPI } {
  const options: RenderChainOptions = { ...DEFAULT_OPTIONS, ...userOptions }
  const nodes = new Map<string, RenderChainNode>()
  const parentMap = new Map<string, string>()
  const childrenMap = new Map<string, Set<string>>()
  let lastRenderTimestamp = 0
  let lastRenderComponentId: string | null = null
  let kernel: Kernel | null = null

  function updateChain(componentId: string, componentName: string, timestamp: number): void {
    // Check if this render is part of the current chain
    const isPartOfChain = timestamp - lastRenderTimestamp < CHAIN_WINDOW

    let node = nodes.get(componentId)
    if (!node) {
      node = {
        componentId,
        componentName,
        triggeredBy: null,
        triggered: [],
        depth: 0,
        timestamp,
      }
      nodes.set(componentId, node)
    }

    node.timestamp = timestamp

    if (isPartOfChain && lastRenderComponentId && lastRenderComponentId !== componentId) {
      // This component was triggered by the last rendered component
      const parentId = lastRenderComponentId

      // Update parent relationship
      node.triggeredBy = parentId
      parentMap.set(componentId, parentId)

      // Update parent's triggered list
      const parentNode = nodes.get(parentId)
      if (parentNode && !parentNode.triggered.includes(componentId)) {
        parentNode.triggered.push(componentId)
      }

      // Update children map
      let children = childrenMap.get(parentId)
      if (!children) {
        children = new Set()
        childrenMap.set(parentId, children)
      }
      children.add(componentId)

      // Calculate depth
      node.depth = (parentNode?.depth ?? 0) + 1

      // Check max depth
      if (node.depth > options.maxDepth) {
        console.warn(
          `[ReactLog] Deep render chain detected: ${componentName} at depth ${node.depth}`
        )
      }
    }

    lastRenderTimestamp = timestamp
    lastRenderComponentId = componentId
  }

  function buildTreeVisualization(
    componentId: string,
    prefix: string = '',
    isLast: boolean = true
  ): string {
    const node = nodes.get(componentId)
    if (!node) return ''

    const connector = isLast ? '\u2514\u2500 ' : '\u251C\u2500 '
    const line = prefix + connector + node.componentName + '\n'

    const children = Array.from(childrenMap.get(componentId) ?? [])
    let childLines = ''

    children.forEach((childId, index) => {
      const isChildLast = index === children.length - 1
      const newPrefix = prefix + (isLast ? '   ' : '\u2502  ')
      childLines += buildTreeVisualization(childId, newPrefix, isChildLast)
    })

    return line + childLines
  }

  const api: RenderChainAPI = {
    getChain(componentId: string): RenderChainNode | null {
      return nodes.get(componentId) ?? null
    },

    getRootCause(componentId: string): string | null {
      let currentId: string | undefined = componentId
      let rootId: string | null = null

      while (currentId) {
        rootId = currentId
        currentId = parentMap.get(currentId)
      }

      return rootId
    },

    getChildren(componentId: string): string[] {
      return Array.from(childrenMap.get(componentId) ?? [])
    },

    getParent(componentId: string): string | null {
      return parentMap.get(componentId) ?? null
    },

    visualizeChain(): string {
      // Find root nodes (nodes with no parent)
      const roots: string[] = []
      for (const [componentId] of nodes) {
        if (!parentMap.has(componentId)) {
          roots.push(componentId)
        }
      }

      if (roots.length === 0) return 'No render chains recorded'

      let visualization = '\uD83D\uDD17 Render Chain:\n'
      roots.forEach((rootId, index) => {
        visualization += buildTreeVisualization(rootId, '   ', index === roots.length - 1)
      })

      return visualization
    },
  }

  const plugin: Plugin = {
    name: 'render-chain',
    version: '1.0.0',
    type: 'optional',

    install(k: Kernel): void {
      kernel = k
    },

    uninstall(): void {
      kernel = null
      nodes.clear()
      parentMap.clear()
      childrenMap.clear()
      lastRenderTimestamp = 0
      lastRenderComponentId = null
    },

    hooks: {
      onMount(event: MountEvent): void {
        updateChain(event.componentId, event.componentName, event.timestamp)
      },

      onUpdate(event: UpdateEvent): void {
        updateChain(event.componentId, event.componentName, event.timestamp)
      },
    },

    api: api as unknown as Record<string, unknown>,
  }

  return plugin as Plugin & { api: RenderChainAPI }
}
