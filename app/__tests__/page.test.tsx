import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../page'

// Mock fetch globally
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main heading and description', () => {
    render(<Home />)
    
    expect(screen.getByText('Excel Addin Remover')).toBeInTheDocument()
    expect(screen.getByText(/Upload an Excel file, analyze its addins/)).toBeInTheDocument()
  })

  it('shows file upload area initially', () => {
    render(<Home />)
    
    expect(screen.getByText('Upload Excel File')).toBeInTheDocument()
    expect(screen.getByText(/Drag and drop your Excel file here/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose File' })).toBeInTheDocument()
  })

  it('handles file selection', async () => {
    render(<Home />)
    
    const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('test.xlsx')).toBeInTheDocument()
      expect(screen.getByText(/File size: 0.00 MB/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Analyze Addins' })).toBeInTheDocument()
    })
  })

  it('shows error for non-xlsx files', async () => {
    render(<Home />)
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('Please select a valid .xlsx file')).toBeInTheDocument()
    })
  })

  it('analyzes file successfully', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        fileName: 'test.xlsx',
        addins: [
          {
            id: '{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}',
            name: 'WA200006846',
            version: '1.1.0.2',
            store: 'en-US',
            storeType: 'omex',
          },
        ],
        addinCount: 1,
      }),
    } as Response)
    
    // Upload file
    const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Analyze Addins' })).toBeInTheDocument()
    })
    
    // Click analyze button
    const analyzeButton = screen.getByRole('button', { name: 'Analyze Addins' })
    await user.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Found 1 addin(s) in the file')).toBeInTheDocument()
      expect(screen.getByText('WA200006846')).toBeInTheDocument()
    })
  })

  it('handles analysis errors', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    // Mock failed API response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to analyze file' }),
    } as Response)
    
    // Upload file
    const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Analyze Addins' })).toBeInTheDocument()
    })
    
    // Click analyze button
    const analyzeButton = screen.getByRole('button', { name: 'Analyze Addins' })
    await user.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to analyze file')).toBeInTheDocument()
    })
  })

  it('allows addin selection and removal', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    // Mock successful analysis
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        fileName: 'test.xlsx',
        addins: [
          {
            id: '{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}',
            name: 'WA200006846',
            version: '1.1.0.2',
            store: 'en-US',
            storeType: 'omex',
          },
        ],
        addinCount: 1,
      }),
    } as Response)
    
    // Mock successful processing
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(['processed content']),
    } as Response)
    
    // Upload and analyze file
    const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Analyze Addins' })).toBeInTheDocument()
    })
    
    const analyzeButton = screen.getByRole('button', { name: 'Analyze Addins' })
    await user.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('WA200006846')).toBeInTheDocument()
    })
    
    // Select addin
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    
    await waitFor(() => {
      expect(screen.getByText('1 addin(s) selected for removal')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Remove 1 Addin(s)' })).toBeInTheDocument()
    })
    
    // Process file
    const removeButton = screen.getByRole('button', { name: 'Remove 1 Addin(s)' })
    await user.click(removeButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Successfully removed 1 addin/)).toBeInTheDocument()
    })
  })

  it('resets file selection', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    // Upload file
    const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('test.xlsx')).toBeInTheDocument()
    })
    
    // Click reset button
    const resetButton = screen.getByRole('button', { name: 'Choose Different File' })
    await user.click(resetButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Drag and drop your Excel file here/)).toBeInTheDocument()
      expect(screen.queryByText('test.xlsx')).not.toBeInTheDocument()
    })
  })

  it('shows API documentation link', () => {
    render(<Home />)
    
    const docsLink = screen.getByRole('link', { name: 'View API Documentation' })
    expect(docsLink).toBeInTheDocument()
    expect(docsLink).toHaveAttribute('href', '/api/docs')
    expect(docsLink).toHaveAttribute('target', '_blank')
  })
})
