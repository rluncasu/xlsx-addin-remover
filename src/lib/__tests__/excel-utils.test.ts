import { promises as fs } from 'fs'
import path from 'path'
import {
  unpackExcelFile,
  removeAddins,
  repackExcelFile,
  cleanupTempDir,
  parseWebExtensionXml,
  ExcelAddin,
} from '../excel-utils'

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    readdir: jest.fn(),
    readFile: jest.fn(),
    access: jest.fn(),
    unlink: jest.fn(),
    rm: jest.fn(),
    stat: jest.fn(),
    writeFile: jest.fn(),
  },
}))

// Mock AdmZip
jest.mock('adm-zip', () => {
  return jest.fn().mockImplementation(() => ({
    extractAllTo: jest.fn(),
    addFile: jest.fn(),
    toBuffer: jest.fn().mockReturnValue(Buffer.from('test')),
  }))
})

const mockFs = fs as jest.Mocked<typeof fs>

describe('Excel Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('parseWebExtensionXml', () => {
    it('should parse valid webextension XML', () => {
      const xmlContent = `
        <we:webextension xmlns:we="http://schemas.microsoft.com/office/webextensions/webextension/2010/11" id="{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}">
          <we:reference id="WA200006846" version="1.1.0.2" store="en-US" storeType="omex"/>
        </we:webextension>
      `
      
      const result = parseWebExtensionXml(xmlContent, '/test/path')
      
      expect(result).toEqual({
        id: '{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}',
        name: 'WA200006846',
        version: '1.1.0.2',
        store: 'en-US',
        storeType: 'omex',
        filePath: '/test/path',
      })
    })

    it('should return null for invalid XML', () => {
      const xmlContent = 'invalid xml content'
      
      const result = parseWebExtensionXml(xmlContent, '/test/path')
      
      expect(result).toBeNull()
    })

    it('should handle missing reference attributes', () => {
      const xmlContent = `
        <we:webextension xmlns:we="http://schemas.microsoft.com/office/webextensions/webextension/2010/11" id="{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}">
          <we:reference/>
        </we:webextension>
      `
      
      const result = parseWebExtensionXml(xmlContent, '/test/path')
      
      expect(result).toBeNull()
    })
  })

  describe('unpackExcelFile', () => {
    it('should unpack Excel file and extract addins', async () => {
      const mockBuffer = Buffer.from('test')
      const fileName = 'test.xlsx'
      
      // Mock file system responses
      mockFs.access.mockResolvedValue(undefined) // webextensions exists
      mockFs.readdir.mockResolvedValue(['webextension1.xml', 'taskpanes.xml'])
      mockFs.readFile.mockResolvedValue(`
        <we:webextension xmlns:we="http://schemas.microsoft.com/office/webextensions/webextension/2010/11" id="{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}">
          <we:reference id="WA200006846" version="1.1.0.2" store="en-US" storeType="omex"/>
        </we:webextension>
      `)
      
      const result = await unpackExcelFile(mockBuffer, fileName)
      
      expect(result.fileName).toBe(fileName)
      expect(result.addins).toHaveLength(1)
      expect(result.addins[0].id).toBe('{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}')
      expect(result.addins[0].name).toBe('WA200006846')
    })

    it('should handle missing webextensions directory', async () => {
      const mockBuffer = Buffer.from('test')
      const fileName = 'test.xlsx'
      
      // Mock webextensions directory doesn't exist
      mockFs.access.mockRejectedValue(new Error('ENOENT'))
      
      const result = await unpackExcelFile(mockBuffer, fileName)
      
      expect(result.fileName).toBe(fileName)
      expect(result.addins).toHaveLength(0)
    })

    it('should handle errors during unpacking', async () => {
      const mockBuffer = Buffer.from('test')
      const fileName = 'test.xlsx'
      
      mockFs.access.mockResolvedValue(undefined)
      mockFs.readdir.mockRejectedValue(new Error('Read error'))
      
      const result = await unpackExcelFile(mockBuffer, fileName)
      
      expect(result.fileName).toBe(fileName)
      expect(result.addins).toHaveLength(0)
    })
  })

  describe('removeAddins', () => {
    it('should remove specified addins and update taskpanes', async () => {
      const tempDir = '/temp/test'
      const addinIds = ['{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}']
      
      mockFs.readdir.mockResolvedValue(['webextension1.xml', 'webextension2.xml'])
      mockFs.readFile.mockResolvedValue(`
        <we:webextension xmlns:we="http://schemas.microsoft.com/office/webextensions/webextension/2010/11" id="{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}">
          <we:reference id="WA200006846" version="1.1.0.2" store="en-US" storeType="omex"/>
        </we:webextension>
      `)
      mockFs.access.mockResolvedValue(undefined) // Files exist
      
      await removeAddins(tempDir, addinIds)
      
      expect(mockFs.unlink).toHaveBeenCalledWith(
        path.join(tempDir, 'xl', 'webextensions', 'webextension1.xml')
      )
      expect(mockFs.writeFile).toHaveBeenCalled()
    })

    it('should handle empty addin list', async () => {
      const tempDir = '/temp/test'
      const addinIds: string[] = []
      
      await removeAddins(tempDir, addinIds)
      
      expect(mockFs.unlink).not.toHaveBeenCalled()
    })

    it('should remove entire webextensions directory if all addins removed', async () => {
      const tempDir = '/temp/test'
      const addinIds = ['{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}']
      
      mockFs.readdir.mockResolvedValue(['webextension1.xml'])
      mockFs.readFile.mockResolvedValue(`
        <we:webextension xmlns:we="http://schemas.microsoft.com/office/webextensions/webextension/2010/11" id="{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}">
          <we:reference id="WA200006846" version="1.1.0.2" store="en-US" storeType="omex"/>
        </we:webextension>
      `)
      mockFs.access.mockResolvedValue(undefined) // Files exist
      
      await removeAddins(tempDir, addinIds)
      
      expect(mockFs.rm).toHaveBeenCalledWith(
        path.join(tempDir, 'xl', 'webextensions'),
        { recursive: true, force: true }
      )
    })

    it('should update Content_Types.xml and root relationships', async () => {
      const tempDir = '/temp/test'
      const addinIds = ['{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}']
      
      mockFs.readdir.mockResolvedValue(['webextension1.xml', 'webextension2.xml'])
      mockFs.readFile.mockResolvedValue(`
        <we:webextension xmlns:we="http://schemas.microsoft.com/office/webextensions/webextension/2010/11" id="{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}">
          <we:reference id="WA200006846" version="1.1.0.2" store="en-US" storeType="omex"/>
        </we:webextension>
      `)
      mockFs.access.mockResolvedValue(undefined) // Files exist
      
      await removeAddins(tempDir, addinIds)
      
      expect(mockFs.writeFile).toHaveBeenCalled()
      expect(mockFs.unlink).toHaveBeenCalled()
    })
  })

  describe('repackExcelFile', () => {
    it('should repack directory into buffer', async () => {
      const tempDir = '/temp/test'
      
      mockFs.readdir.mockResolvedValue(['file1.xml', 'dir1'])
      mockFs.stat.mockResolvedValue({
        isDirectory: () => false,
      } as fs.Stats)
      mockFs.readFile.mockResolvedValue(Buffer.from('test content'))
      
      const result = await repackExcelFile(tempDir)
      
      expect(result).toBeInstanceOf(Buffer)
    })
  })

  describe('cleanupTempDir', () => {
    it('should remove temporary directory', async () => {
      const tempDir = '/temp/test'
      
      await cleanupTempDir(tempDir)
      
      expect(mockFs.rm).toHaveBeenCalledWith(tempDir, {
        recursive: true,
        force: true,
      })
    })

    it('should handle cleanup errors gracefully', async () => {
      const tempDir = '/temp/test'
      
      mockFs.rm.mockRejectedValue(new Error('Cleanup error'))
      
      // Should not throw
      await expect(cleanupTempDir(tempDir)).resolves.toBeUndefined()
    })
  })
})
