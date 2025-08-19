import { parseWebExtensionXml } from '../excel-utils'

describe('Simple Tests', () => {
  it('should parse webextension XML correctly', () => {
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

  it('should handle basic math', () => {
    expect(2 + 2).toBe(4)
    expect(10 - 5).toBe(5)
    expect(3 * 4).toBe(12)
  })

  it('should handle string operations', () => {
    expect('hello' + ' world').toBe('hello world')
    expect('test'.toUpperCase()).toBe('TEST')
    expect('TEST'.toLowerCase()).toBe('test')
  })
})
