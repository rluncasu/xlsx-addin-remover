# Testing Documentation

This document explains the testing strategy for the Excel Addin Remover webapp and why we use Jest instead of custom testing scripts.

## Why Jest Instead of Custom Testing?

### Problems with Custom Testing Scripts

The original `test-api.js` script had several limitations:

1. **No Test Isolation**: All tests ran in the same context, making it hard to isolate failures
2. **No Assertions**: Only console.log outputs, no proper assertions or test results
3. **No Coverage**: No way to measure code coverage
4. **No Mocking**: Couldn't properly mock dependencies
5. **No CI Integration**: Not suitable for continuous integration
6. **No Parallel Execution**: Tests ran sequentially
7. **No Test Reporting**: No structured test results or reporting

### Benefits of Jest Testing

1. **Comprehensive Testing Framework**: Jest provides a complete testing ecosystem
2. **Proper Assertions**: Built-in expect() assertions with detailed error messages
3. **Test Isolation**: Each test runs in isolation with proper setup/teardown
4. **Mocking Support**: Easy mocking of modules, functions, and external dependencies
5. **Code Coverage**: Built-in coverage reporting
6. **Watch Mode**: Automatic re-running of tests on file changes
7. **CI Integration**: Perfect for automated testing in CI/CD pipelines
8. **Parallel Execution**: Tests can run in parallel for faster execution
9. **Structured Reporting**: Clear test results with pass/fail status

## Test Structure

### Unit Tests (`src/lib/__tests__/excel-utils.test.ts`)

Tests for the core Excel processing utilities:

```typescript
describe('Excel Utils', () => {
  describe('parseWebExtensionXml', () => {
    it('should parse valid webextension XML', () => {
      // Test implementation
    })
  })
})
```

**Coverage:**
- XML parsing functionality
- Error handling
- Edge cases
- File system operations

### API Tests (`src/app/api/__tests__/`)

Tests for API endpoints:

```typescript
describe('/api/analyze-excel', () => {
  describe('POST', () => {
    it('should analyze Excel file successfully', async () => {
      // Test implementation
    })
  })
})
```

**Coverage:**
- Request/response handling
- File validation
- Error responses
- HTTP status codes

### Component Tests (`src/app/__tests__/page.test.tsx`)

Tests for React components using React Testing Library:

```typescript
describe('Home Page', () => {
  it('renders the main heading and description', () => {
    render(<Home />)
    expect(screen.getByText('Excel Addin Remover')).toBeInTheDocument()
  })
})
```

**Coverage:**
- Component rendering
- User interactions
- State management
- API integration

## Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

### Jest Setup (`jest.setup.js`)

```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      // ... other router methods
    }
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
```

## Running Tests

### Available Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI (no watch mode, with coverage)
npm run test:ci

# Run specific test file
npm test -- --testPathPattern=excel-utils.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="parse.*XML"
```

### Test Output Example

```
 PASS  src/lib/__tests__/excel-utils.test.ts
  Excel Utils
    parseWebExtensionXml
      ✓ should parse valid webextension XML (1 ms)
      ✓ should return null for invalid XML (2 ms)
    unpackExcelFile
      ✓ should unpack Excel file and extract addins (1 ms)
      ✓ should handle missing webextensions directory

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        0.233 s
```

## Mocking Strategy

### Module Mocking

```typescript
// Mock the excel-utils module
jest.mock('@/lib/excel-utils', () => ({
  unpackExcelFile: jest.fn(),
  cleanupTempDir: jest.fn(),
}))

const { unpackExcelFile, cleanupTempDir } = require('@/lib/excel-utils')
```

### Function Mocking

```typescript
// Mock fetch responses
mockFetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({
    fileName: 'test.xlsx',
    addins: [],
    addinCount: 0,
  }),
} as Response)
```

### File System Mocking

```typescript
// Mock fs module
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    readdir: jest.fn(),
    readFile: jest.fn(),
    // ... other fs methods
  },
}))
```

## Best Practices

### Test Organization

1. **Group Related Tests**: Use `describe` blocks to group related tests
2. **Clear Test Names**: Use descriptive test names that explain the behavior
3. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification
4. **Test Isolation**: Each test should be independent and not rely on other tests

### Writing Effective Tests

```typescript
describe('Excel Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks() // Reset mocks between tests
  })

  it('should handle valid input correctly', () => {
    // Arrange
    const input = 'valid input'
    
    // Act
    const result = processInput(input)
    
    // Assert
    expect(result).toBe('expected output')
  })

  it('should handle errors gracefully', () => {
    // Arrange
    const invalidInput = null
    
    // Act & Assert
    expect(() => processInput(invalidInput)).toThrow('Invalid input')
  })
})
```

### Coverage Goals

- **Lines**: 70% minimum
- **Functions**: 70% minimum
- **Branches**: 70% minimum
- **Statements**: 70% minimum

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run lint
```

## Debugging Tests

### Debug Mode

```bash
# Run tests with debug output
DEBUG=* npm test

# Run specific test with debug
npm test -- --testNamePattern="specific test" --verbose
```

### Common Issues

1. **Mock Not Working**: Ensure mocks are defined before imports
2. **Async Tests**: Use `async/await` or return promises
3. **Component Tests**: Use `waitFor` for async operations
4. **File System Tests**: Mock fs operations properly

## Conclusion

Jest provides a robust, feature-rich testing framework that far exceeds the capabilities of custom testing scripts. It enables:

- **Reliable Testing**: Consistent, repeatable test execution
- **Better Development**: Fast feedback with watch mode
- **Quality Assurance**: Comprehensive coverage reporting
- **Team Collaboration**: Standardized testing practices
- **CI/CD Integration**: Automated testing in deployment pipelines

The investment in proper testing infrastructure pays dividends in code quality, maintainability, and developer productivity.
