/**
 * Counter for generating unique IDs
 */
let counter = 0

/**
 * Generates a unique ID
 * Uses a combination of timestamp and counter for uniqueness
 *
 * @returns A unique string ID
 */
export function generateUID(): string {
  const timestamp = Date.now().toString(36)
  const count = (counter++).toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${count}-${random}`
}

/**
 * Generates a short unique ID (8 characters)
 * Useful for display purposes
 *
 * @returns A short unique string ID
 */
export function generateShortUID(): string {
  const random = Math.random().toString(36).substring(2, 10)
  return random
}

/**
 * Resets the counter (for testing purposes)
 */
export function resetUIDCounter(): void {
  counter = 0
}
