import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock File API
global.File = class File {
  constructor(bits, name, options = {}) {
    this.name = name
    this.size = bits.length
    this.type = options.type || ''
  }
}

// Mock FormData
global.FormData = class FormData {
  constructor() {
    this.data = new Map()
  }
  
  append(key, value) {
    this.data.set(key, value)
  }
  
  get(key) {
    return this.data.get(key)
  }
  
  has(key) {
    return this.data.has(key)
  }
}

// Mock URL.createObjectURL and URL.revokeObjectURL
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mocked-url'),
    revokeObjectURL: jest.fn(),
  },
  writable: true,
})

// Mock document.createElement for anchor elements
const originalCreateElement = document.createElement.bind(document)
document.createElement = jest.fn((tagName) => {
  if (tagName === 'a') {
    const element = originalCreateElement(tagName)
    return {
      ...element,
      href: '',
      download: '',
      click: jest.fn(),
      setAttribute: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn(),
    }
  }
  return originalCreateElement(tagName)
})

// Mock document.body
Object.defineProperty(document, 'body', {
  value: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  },
  writable: true,
})
