# Excel Addin Remover

A comprehensive solution for analyzing and removing addins from Excel (.xlsx) files. This project includes both a modern Next.js web application and utility functions for programmatic access.

## Project Overview

Excel files (.xlsx) are essentially ZIP archives containing XML files. Addins are stored in the `xl/webextensions/` directory as XML files. This tool allows you to:

- **Analyze** Excel files to discover all installed addins
- **Selectively remove** unwanted addins
- **Download** the cleaned Excel file

## Project Structure

```
xlsx-addin-remover/
├── file-examples/           # Example Excel files for testing
│   └── RadusTest/          # Sample file with 3 addins
├── webapp/                  # Next.js web application
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   │   ├── api/        # REST API endpoints
│   │   │   └── page.tsx    # Main web interface
│   │   └── lib/
│   │       └── excel-utils.ts  # Core Excel processing logic
│   ├── README.md           # Webapp documentation
│   └── DEPLOYMENT.md       # Deployment guide
└── README.md               # This file
```

## Features

### Web Application (`/webapp`)
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- **Drag & Drop**: Easy file upload with drag and drop support
- **Real-time Analysis**: Instant addin detection and display
- **Selective Removal**: Choose which addins to remove
- **API Documentation**: Built-in Swagger UI for API exploration
- **REST API**: Public endpoints for programmatic access

### Core Functionality
- **File Unpacking**: Extracts .xlsx files (ZIP archives) to access internal structure
- **Addin Detection**: Scans `xl/webextensions/` directory for addin definitions
- **XML Parsing**: Extracts addin information from webextension XML files
- **Selective Removal**: Removes only selected addins while preserving others
- **File Repacking**: Rebuilds the Excel file structure and creates new .xlsx

## Quick Start

### Web Application

1. **Navigate to webapp directory:**
   ```bash
   cd webapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Visit `http://localhost:3000` (or the port shown in terminal)

### API Usage

The webapp provides REST API endpoints:

- **Analyze Excel**: `POST /api/analyze-excel`
- **Process Excel**: `POST /api/process-excel`
- **API Documentation**: `GET /api/docs`
- **Swagger UI**: Visit `/docs`

## Example Usage

### Web Interface
1. Upload an Excel file
2. Click "Analyze Addins" to scan for addins
3. Select addins to remove using checkboxes
4. Click "Remove Selected Addin(s)" to process
5. Download the cleaned file

### API Example
```bash
# Analyze a file
curl -X POST http://localhost:3000/api/analyze-excel \
  -F "file=@your-file.xlsx"

# Process and remove addins
curl -X POST http://localhost:3000/api/process-excel \
  -F "file=@your-file.xlsx" \
  -F "selectedAddinIds=[\"{ADDIN-ID}\"]" \
  --output cleaned-file.xlsx
```

## Excel Addin Structure

Based on analysis of the `RadusTest` example file, Excel addins are structured as:

```
xl/
├── webextensions/
│   ├── webextension1.xml    # Addin definition
│   ├── webextension2.xml    # Addin definition
│   ├── webextension3.xml    # Addin definition
│   ├── taskpanes.xml        # Taskpane configuration
│   └── _rels/
│       └── taskpanes.xml.rels  # Relationship definitions
```

Each `webextension*.xml` contains:
- **ID**: Unique identifier (GUID)
- **Reference**: Addin name, version, store information
- **Properties**: Configuration settings
- **Custom Functions**: Function definitions
- **Background Apps**: Runtime configuration

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **File Processing**: adm-zip for ZIP/Excel manipulation
- **API Documentation**: Swagger/OpenAPI 3.0
- **Development**: ESLint, TypeScript

## Deployment

The webapp can be deployed to various platforms:

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **Docker**
- **Traditional servers**

See `webapp/DEPLOYMENT.md` for detailed deployment instructions.

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development
```bash
cd webapp
npm install
npm run dev
```

### Testing
```bash
npm run test-api  # Test API endpoints
npm run lint      # Run ESLint
```

### Building
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the documentation in `/webapp/README.md`
2. Review API documentation at `/docs`
3. Open an issue on the GitHub repository

## Example Files

The `file-examples/RadusTest/` directory contains a sample Excel file with 3 addins:
- **Addin 1**: Office Store addin (WA200006846)
- **Addin 2**: Developer catalog addin (c60a5044-bee5-4136-9926-729fbdbf8d24)
- **Addin 3**: Developer catalog addin (b05729db-6968-4c58-af07-2fed68395c13)

This file can be used for testing the application functionality.
