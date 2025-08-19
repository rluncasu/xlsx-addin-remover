import { NextRequest, NextResponse } from 'next/server';
import { unpackExcelFile, removeAddins, repackExcelFile, cleanupTempDir, ExcelFileInfo } from '@/lib/excel-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const selectedAddinIds = formData.get('selectedAddinIds') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx')) {
      return NextResponse.json({ error: 'Only .xlsx files are supported' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Unpack the Excel file
    const fileInfo: ExcelFileInfo & { tempDir: string } = await unpackExcelFile(buffer, file.name);
    
    if (selectedAddinIds) {
      const addinIds = JSON.parse(selectedAddinIds);
      
      if (addinIds.length > 0) {
        // Remove selected addins
        await removeAddins(fileInfo.tempDir, addinIds);
      }
    }
    
    // Repack the file
    const processedBuffer = await repackExcelFile(fileInfo.tempDir);
    
    // Clean up temp directory
    await cleanupTempDir(fileInfo.tempDir);
    
    // Return the processed file
    const response = new NextResponse(new Uint8Array(processedBuffer));
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', `attachment; filename="processed_${file.name}"`);
    
    return response;
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return NextResponse.json({ error: 'Failed to process Excel file' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Excel Addin Remover API',
    endpoints: {
      'POST /api/process-excel': 'Process Excel file and remove selected addins',
      'GET /api/analyze-excel': 'Analyze Excel file and return addin information'
    }
  });
}
