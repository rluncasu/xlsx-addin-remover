import AdmZip from 'adm-zip';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export interface ExcelAddin {
  id: string;
  name: string;
  version: string;
  store: string;
  storeType: string;
  filePath: string;
}

export interface ExcelFileInfo {
  addins: ExcelAddin[];
  fileName: string;
  tempDir: string;
}

/**
 * Unpacks an Excel (.xlsx) file and extracts addin information
 */
export async function unpackExcelFile(fileBuffer: Buffer, fileName: string): Promise<ExcelFileInfo> {
  const zip = new AdmZip(fileBuffer);
  // Use system temp directory for serverless compatibility
  const tempDir = path.join(os.tmpdir(), `excel-addin-remover-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // Create temp directory
  await fs.mkdir(tempDir, { recursive: true });
  
  // Extract all files
  zip.extractAllTo(tempDir, true);
  
  const addins: ExcelAddin[] = [];
  
  // Check for webextensions directory
  const webextensionsPath = path.join(tempDir, 'xl', 'webextensions');
  
  try {
    const webextensionsExists = await fs.access(webextensionsPath).then(() => true).catch(() => false);
    
    if (webextensionsExists) {
      const files = await fs.readdir(webextensionsPath);
      const webextensionFiles = files.filter(file => file.startsWith('webextension') && file.endsWith('.xml'));
      
      for (const file of webextensionFiles) {
        const filePath = path.join(webextensionsPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Parse the XML to extract addin information
        const addin = parseWebExtensionXml(content, filePath);
        if (addin) {
          addins.push(addin);
        }
      }
    }
  } catch (error) {
    console.error('Error reading webextensions:', error);
  }
  
  return {
    addins,
    fileName,
    tempDir // Store temp directory for later cleanup
  };
}

/**
 * Parses a webextension XML file to extract addin information
 */
export function parseWebExtensionXml(content: string, filePath: string): ExcelAddin | null {
  try {
    // Extract ID from the webextension tag
    const idMatch = content.match(/id="([^"]+)"/);
    const id = idMatch ? idMatch[1] : '';
    
    // Extract reference information
    const referenceMatch = content.match(/<we:reference[^>]*id="([^"]+)"[^>]*version="([^"]+)"[^>]*store="([^"]+)"[^>]*storeType="([^"]+)"/);
    
    if (!referenceMatch) return null;
    
    const [, referenceId, version, store, storeType] = referenceMatch;
    
    return {
      id,
      name: referenceId,
      version,
      store,
      storeType,
      filePath
    };
  } catch (error) {
    console.error('Error parsing webextension XML:', error);
    return null;
  }
}

/**
 * Removes selected addins from the Excel file structure
 */
export async function removeAddins(tempDir: string, addinIds: string[]): Promise<void> {
  const webextensionsPath = path.join(tempDir, 'xl', 'webextensions');
  
  try {
    // Read taskpanes.xml to understand the relationships
    const taskpanesPath = path.join(webextensionsPath, 'taskpanes.xml');
    await fs.readFile(taskpanesPath, 'utf-8');
    
    // Read relationships file
    const relsPath = path.join(webextensionsPath, '_rels', 'taskpanes.xml.rels');
    await fs.readFile(relsPath, 'utf-8');
    
    // Parse relationships to find which files to remove
    const filesToRemove = new Set<string>();
    
    // Get all webextension files first
    const files = await fs.readdir(webextensionsPath);
    const webextensionFiles = files.filter(file => file.startsWith('webextension') && file.endsWith('.xml'));
    
    console.log('All webextension files found:', webextensionFiles);
    
    // Check each webextension file for the addin IDs
    for (const file of webextensionFiles) {
      const filePath = path.join(webextensionsPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extract the addin ID from this file
      const idMatch = content.match(/id="([^"]+)"/);
      if (idMatch) {
        const fileAddinId = idMatch[1];
        console.log(`File ${file} contains addin ID: ${fileAddinId}`);
        
        // Check if this addin ID is in the list to remove
        if (addinIds.includes(fileAddinId)) {
          filesToRemove.add(file);
          console.log(`Marking ${file} for removal (contains ${fileAddinId})`);
        }
      }
    }
    
    // Remove the webextension files
    for (const file of filesToRemove) {
      await fs.unlink(path.join(webextensionsPath, file));
    }
    
    // Update taskpanes.xml and relationships
    await updateTaskpanesAndRelationships(webextensionsPath, filesToRemove);
    
    // Update Content_Types.xml
    await updateContentTypes(tempDir, filesToRemove);
    
    // Update root relationships if needed
    await updateRootRelationships(tempDir);
    
  } catch (error) {
    console.error('Error removing addins:', error);
    throw error;
  }
}

/**
 * Updates Content_Types.xml to remove references to deleted webextension files
 */
async function updateContentTypes(tempDir: string, filesToRemove: Set<string>): Promise<void> {
  try {
    const contentTypesPath = path.join(tempDir, '[Content_Types].xml');
    
    // Check if file exists
    const exists = await fs.access(contentTypesPath).then(() => true).catch(() => false);
    if (!exists) {
      console.log('Content_Types.xml not found');
      return;
    }
    
    let content = await fs.readFile(contentTypesPath, 'utf-8');
    console.log('Original Content_Types.xml content:', content);
    
    // Remove Override entries for deleted webextension files
    for (const file of filesToRemove) {
      const overrideRegex = new RegExp(`<Override PartName="/xl/webextensions/${file}"[^>]*/>\\s*`, 'g');
      const beforeCount = (content.match(/<Override PartName="/g) || []).length;
      content = content.replace(overrideRegex, '');
      const afterCount = (content.match(/<Override PartName="/g) || []).length;
      console.log(`Removed ${beforeCount - afterCount} Override entries for ${file}`);
    }
    
    // Clean up any empty Types element
    content = content.replace(/<Types[^>]*>\s*<\/Types>/, '');
    
    console.log('Updated Content_Types.xml content:', content);
    await fs.writeFile(contentTypesPath, content, 'utf-8');
    console.log('Successfully updated Content_Types.xml');
    
  } catch (error) {
    console.error('Error updating Content_Types.xml:', error);
  }
}

/**
 * Updates root relationships to remove references to deleted webextension files
 */
async function updateRootRelationships(tempDir: string): Promise<void> {
  try {
    const rootRelsPath = path.join(tempDir, '_rels', '.rels');
    
    // Check if file exists
    const exists = await fs.access(rootRelsPath).then(() => true).catch(() => false);
    if (!exists) {
      console.log('Root relationships file not found');
      return;
    }
    
    let content = await fs.readFile(rootRelsPath, 'utf-8');
    console.log('Original root relationships content:', content);
    
    // If we're removing all webextension files, remove the webextensiontaskpanes relationship
    // Check if the webextensions directory still exists
    const webextensionsPath = path.join(tempDir, 'xl', 'webextensions');
    let remainingWebextensions: string[] = [];
    
    try {
      const remainingFiles = await fs.readdir(webextensionsPath);
      remainingWebextensions = remainingFiles.filter(file => file.startsWith('webextension') && file.endsWith('.xml'));
      console.log('Remaining webextension files:', remainingWebextensions);
    } catch {
      // Directory doesn't exist (was already removed), so no webextensions remain
      console.log('Webextensions directory was already removed, no webextensions remain');
      remainingWebextensions = [];
    }
    
    if (remainingWebextensions.length === 0) {
      // Remove the webextensiontaskpanes relationship
      const relRegex = /<Relationship Id="[^"]+" Type="http:\/\/schemas\.microsoft\.com\/office\/2011\/relationships\/webextensiontaskpanes"[^>]*\/>\s*/g;
      const beforeCount = (content.match(/<Relationship/g) || []).length;
      content = content.replace(relRegex, '');
      const afterCount = (content.match(/<Relationship/g) || []).length;
      console.log(`Removed ${beforeCount - afterCount} webextensiontaskpanes relationships`);
    }
    
    // Clean up any empty Relationships element
    content = content.replace(/<Relationships[^>]*>\s*<\/Relationships>/, '');
    
    console.log('Updated root relationships content:', content);
    await fs.writeFile(rootRelsPath, content, 'utf-8');
    console.log('Successfully updated root relationships');
    
  } catch (error) {
    console.error('Error updating root relationships:', error);
  }
}

/**
 * Updates taskpanes.xml and relationships after removing addins
 */
async function updateTaskpanesAndRelationships(webextensionsPath: string, filesToRemove: Set<string>): Promise<void> {
  try {
    const taskpanesPath = path.join(webextensionsPath, 'taskpanes.xml');
    const relsPath = path.join(webextensionsPath, '_rels', 'taskpanes.xml.rels');
    
    // Check if files exist
    const taskpanesExists = await fs.access(taskpanesPath).then(() => true).catch(() => false);
    const relsExists = await fs.access(relsPath).then(() => true).catch(() => false);
    
    if (!taskpanesExists || !relsExists) {
      console.log('Taskpanes or relationships files not found');
      return;
    }
    
    // Read current files
    const taskpanesContent = await fs.readFile(taskpanesPath, 'utf-8');
    const relsContent = await fs.readFile(relsPath, 'utf-8');
    
    console.log('Original taskpanes content:', taskpanesContent);
    console.log('Original relationships content:', relsContent);
    
    // Get remaining webextension files
    const remainingFiles = await fs.readdir(webextensionsPath);
    const webextensionFiles = remainingFiles.filter(file => file.startsWith('webextension') && file.endsWith('.xml'));
    
    console.log('Webextension files found:', webextensionFiles);
    
    // If all webextension files are being removed, remove the entire webextensions directory
    if (filesToRemove.size === webextensionFiles.length) {
      console.log('Removing entire webextensions directory');
      await fs.rm(webextensionsPath, { recursive: true, force: true });
      return;
    }
    
    // Update taskpanes.xml by removing references to deleted webextensions
    let updatedTaskpanes = taskpanesContent;
    let updatedRels = relsContent;
    
    // Remove taskpane entries that reference the deleted webextensions
    for (const fileToRemove of filesToRemove) {
      // Find the relationship ID for this webextension file
      const relMatch = relsContent.match(new RegExp(`Id="([^"]+)"[^>]*Target="${fileToRemove}"`));
      if (relMatch) {
        const relId = relMatch[1];
        console.log(`Found relationship ID ${relId} for file ${fileToRemove}`);
        
        // Remove the taskpane entry that references this relationship
        const taskpaneRegex = new RegExp(`<wetp:taskpane[^>]*>\\s*<wetp:webextensionref[^>]*r:id="${relId}"[^>]*/>\\s*</wetp:taskpane>`, 'g');
        updatedTaskpanes = updatedTaskpanes.replace(taskpaneRegex, '');
        
        // Remove the relationship entry
        const relRegex = new RegExp(`<Relationship Id="${relId}"[^>]*/>\\s*`, 'g');
        updatedRels = updatedRels.replace(relRegex, '');
      } else {
        console.log(`No relationship found for file ${fileToRemove}`);
      }
    }
    
    console.log('Updated taskpanes content:', updatedTaskpanes);
    console.log('Updated relationships content:', updatedRels);
    
    // Clean up empty taskpanes container if no taskpanes remain
    if (!updatedTaskpanes.includes('<wetp:taskpane')) {
      updatedTaskpanes = updatedTaskpanes.replace(/<wetp:taskpanes[^>]*>[\s\S]*<\/wetp:taskpanes>/, '');
    }
    
    // Clean up empty relationships if no relationships remain
    if (!updatedRels.includes('<Relationship')) {
      updatedRels = updatedRels.replace(/<Relationships[^>]*>[\s\S]*<\/Relationships>/, '');
    }
    
    // Write updated files
    await fs.writeFile(taskpanesPath, updatedTaskpanes, 'utf-8');
    await fs.writeFile(relsPath, updatedRels, 'utf-8');
    
    console.log('Successfully updated taskpanes and relationships files');
    
  } catch (error) {
    console.error('Error updating taskpanes and relationships:', error);
    // If there's an error updating the files, fall back to removing the entire directory
    try {
      await fs.rm(webextensionsPath, { recursive: true, force: true });
    } catch (rmError) {
      console.error('Error removing webextensions directory:', rmError);
    }
  }
}

/**
 * Repacks the Excel file structure back into a .xlsx file
 */
export async function repackExcelFile(tempDir: string): Promise<Buffer> {
  const zip = new AdmZip();
  
  // Add all files from temp directory to zip
  await addDirectoryToZip(zip, tempDir, '');
  
  return zip.toBuffer();
}

/**
 * Recursively adds a directory to the zip file
 */
async function addDirectoryToZip(zip: AdmZip, dirPath: string, zipPath: string): Promise<void> {
  const files = await fs.readdir(dirPath);
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      await addDirectoryToZip(zip, fullPath, path.join(zipPath, file));
    } else {
      const content = await fs.readFile(fullPath);
      zip.addFile(path.join(zipPath, file), content);
    }
  }
}

/**
 * Cleans up temporary directory
 */
export async function cleanupTempDir(tempDir: string): Promise<void> {
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Error cleaning up temp directory:', error);
  }
}
