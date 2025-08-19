import { NextRequest } from 'next/server'
import { POST, GET } from '../process-excel/route'

// Mock the excel-utils module
jest.mock('@/lib/excel-utils', () => ({
  unpackExcelFile: jest.fn(),
  removeAddins: jest.fn(),
  repackExcelFile: jest.fn(),
  cleanupTempDir: jest.fn(),
}))

import { unpackExcelFile, removeAddins, repackExcelFile, cleanupTempDir } from '@/lib/excel-utils'

describe('/api/process-excel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('should process Excel file and remove selected addins', async () => {
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

      repackExcelFile.mockResolvedValue(Buffer.from('processed file content'))

      const formData = new FormData()
      const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      formData.append('file', file)
      formData.append('selectedAddinIds', JSON.stringify(['{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}']))

      const request = new NextRequest('http://localhost:3000/api/process-excel', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="processed_test.xlsx"')
      expect(removeAddins).toHaveBeenCalledWith('/temp/test', ['{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}'])
      expect(cleanupTempDir).toHaveBeenCalledWith('/temp/test')
    })

    it('should process file without removing addins when no addins selected', async () => {
      unpackExcelFile.mockResolvedValue({
        fileName: 'test.xlsx',
        addins: [],
        tempDir: '/temp/test',
      })

      repackExcelFile.mockResolvedValue(Buffer.from('processed file content'))

      const formData = new FormData()
      const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      formData.append('file', file)

      const request = new NextRequest('http://localhost:3000/api/process-excel', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(removeAddins).not.toHaveBeenCalled()
    })

    it('should return error when no file is provided', async () => {
      const formData = new FormData()
      const request = new NextRequest('http://localhost:3000/api/process-excel', {
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

      const request = new NextRequest('http://localhost:3000/api/process-excel', {
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

      const request = new NextRequest('http://localhost:3000/api/process-excel', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to process Excel file')
    })
  })

  describe('GET', () => {
    it('should return endpoint information', async () => {
      const request = new NextRequest('http://localhost:3000/api/process-excel')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Excel Addin Remover API')
      expect(data.endpoints).toBeDefined()
    })
  })
})
