import { NextRequest, NextResponse } from 'next/server';
import { unpackExcelFile, cleanupTempDir } from '@/lib/excel-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx')) {
      return NextResponse.json({ error: 'Only .xlsx files are supported' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Unpack the Excel file to analyze addins
    const fileInfo: any = await unpackExcelFile(buffer, file.name);
    
    // Clean up temp directory
    await cleanupTempDir(fileInfo.tempDir);
    
    // Return addin information
    return NextResponse.json({
      fileName: fileInfo.fileName,
      addins: fileInfo.addins,
      addinCount: fileInfo.addins.length
    });
    
  } catch (error) {
    console.error('Error analyzing Excel file:', error);
    return NextResponse.json({ error: 'Failed to analyze Excel file' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Excel Addin Analyzer API',
    description: 'Analyze Excel files and return addin information',
    method: 'POST',
    body: 'FormData with "file" field containing .xlsx file'
  });
}
