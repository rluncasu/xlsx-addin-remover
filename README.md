# Excel Addin Remover Webapp

A modern Next.js web application for analyzing and removing addins from Excel (.xlsx) files. The app provides both a user-friendly web interface and a comprehensive REST API.

## Features

- **File Upload**: Drag and drop or browse to upload Excel (.xlsx) files
- **Addin Analysis**: Automatically detect and display all addins in the uploaded file
- **Selective Removal**: Choose which addins to remove from the file
- **File Download**: Download the processed file with selected addins removed
- **REST API**: Public API endpoints for programmatic access
- **Swagger Documentation**: Complete API documentation with interactive testing

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **File Processing**: adm-zip for Excel file manipulation
- **API Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd xlsx-addin-remover/webapp
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Web Interface

1. **Upload File**: Click "Choose File" or drag and drop an Excel (.xlsx) file
2. **Analyze Addins**: Click "Analyze Addins" to scan the file for addins
3. **Select Addins**: Check the boxes next to addins you want to remove
4. **Process File**: Click "Remove Selected Addin(s)" to process the file
5. **Download**: The processed file will automatically download

### API Usage

#### Analyze Excel File

```bash
curl -X POST http://localhost:3000/api/analyze-excel \
  -F "file=@your-file.xlsx"
```

Response:
```json
{
  "fileName": "your-file.xlsx",
  "addins": [
    {
      "id": "{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}",
      "name": "WA200006846",
      "version": "1.1.0.2",
      "store": "en-US",
      "storeType": "omex"
    }
  ],
  "addinCount": 1
}
```

#### Process Excel File

```bash
curl -X POST http://localhost:3000/api/process-excel \
  -F "file=@your-file.xlsx" \
  -F "selectedAddinIds=[\"{95AE2F8B-2D0F-4002-A049-EEA6ACF6B70B}\"]" \
  --output processed-file.xlsx
```

## API Documentation

Visit `/docs` to view the interactive Swagger documentation, or access the raw OpenAPI spec at `/api/docs`.

## Project Structure

```
webapp/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze-excel/
│   │   │   │   └── route.ts          # Analyze Excel files
│   │   │   ├── process-excel/
│   │   │   │   └── route.ts          # Process and remove addins
│   │   │   └── docs/
│   │   │       └── route.ts          # Swagger documentation
│   │   ├── docs/
│   │   │   └── page.tsx              # Swagger UI page
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main application page
│   └── lib/
│       └── excel-utils.ts            # Excel processing utilities
├── public/                           # Static assets
└── package.json
```

## How It Works

1. **File Upload**: Excel files are uploaded via the web interface or API
2. **Unpacking**: The .xlsx file (which is a ZIP archive) is unpacked using adm-zip
3. **Addin Detection**: The app scans the `xl/webextensions/` directory for addin definitions
4. **XML Parsing**: Each `webextension*.xml` file is parsed to extract addin information
5. **User Selection**: Users can select which addins to remove
6. **Addin Removal**: Selected addin files are removed from the structure
7. **Repacking**: The modified file structure is repacked into a new .xlsx file
8. **Download**: The processed file is returned to the user

## Excel Addin Structure

Excel addins are stored in the following structure within .xlsx files:

```
xl/
├── webextensions/
│   ├── webextension1.xml
│   ├── webextension2.xml
│   ├── taskpanes.xml
│   └── _rels/
│       └── taskpanes.xml.rels
```

Each `webextension*.xml` file contains:
- Addin ID
- Reference information (name, version, store)
- Properties and bindings
- Custom functions and background app settings

## Development

### Building for Production

```bash
npm run build
npm start
```

### Testing

The project includes a comprehensive Jest testing setup:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

#### Test Structure

- **Unit Tests**: `src/lib/__tests__/excel-utils.test.ts` - Tests for Excel processing utilities
- **API Tests**: `src/app/api/__tests__/` - Tests for API endpoints
- **Component Tests**: `src/app/__tests__/page.test.tsx` - Tests for React components

#### Test Coverage

The test suite covers:
- Excel file parsing and processing
- Addin detection and removal
- API endpoint functionality
- Error handling and edge cases
- User interface interactions

### Code Formatting

```bash
npm run lint
```

## Deployment

The webapp can be deployed to various platforms:

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **Docker**
- **Traditional servers**

See `DEPLOYMENT.md` for detailed deployment instructions.

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
