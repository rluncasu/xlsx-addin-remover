import { NextRequest } from 'next/server'
import { POST, GET } from '../analyze-excel/route'

// Mock the excel-utils module
jest.mock('@/lib/excel-utils', () => ({
  unpackExcelFile: jest.fn(),
  cleanupTempDir: jest.fn(),
}))

import { unpackExcelFile, cleanupTempDir } from '@/lib/excel-utils'

describe('/api/analyze-excel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('should analyze Excel file successfully', async () => {
      const mockAddins = [
        {
          id: '{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}',
          name: 'WA200006846',
          version: '1.1.0.2',
          store: 'en-US',
          storeType: 'omex',
          filePath: '/test/path',
        },
      ]

      unpackExcelFile.mockResolvedValue({
        fileName: 'test.xlsx',
        addins: mockAddins,
        tempDir: '/temp/test',
      })

      const formData = new FormData()
      const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      formData.append('file', file)

      const request = new NextRequest('http://localhost:3000/api/analyze-excel', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.fileName).toBe('test.xlsx')
      expect(data.addins).toEqual(mockAddins)
      expect(data.addinCount).toBe(1)
      expect(cleanupTempDir).toHaveBeenCalledWith('/temp/test')
    })

    it('should return error when no file is provided', async () => {
      const formData = new FormData()
      const request = new NextRequest('http://localhost:3000/api/analyze-excel', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No file provided')
    })

    it('should return error for non-xlsx files', async () => {
      const formData = new FormData()
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      formData.append('file', file)

      const request = new NextRequest('http://localhost:3000/api/analyze-excel', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Only .xlsx files are supported')
    })

    it('should handle processing errors', async () => {
      unpackExcelFile.mockRejectedValue(new Error('Processing error'))

      const formData = new FormData()
      const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      formData.append('file', file)

      const request = new NextRequest('http://localhost:3000/api/analyze-excel', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to analyze Excel file')
    })
  })

  describe('GET', () => {
    it('should return endpoint information', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze-excel')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Excel Addin Analyzer API')
      expect(data.description).toBe('Analyze Excel files and return addin information')
      expect(data.method).toBe('POST')
    })
  })
})
