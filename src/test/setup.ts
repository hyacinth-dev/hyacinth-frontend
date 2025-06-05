import { vi } from 'vitest'

// Mock window.fetch for tests
Object.defineProperty(window, 'fetch', {
  writable: true,
  value: vi.fn()
})

// Setup test environment globals
global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
}
