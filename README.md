# Excel Addin Remover

A Next.js web application that allows users to upload Excel files, analyze their addins, and remove unwanted ones.

## Project Structure

This project has been restructured to match a modern Next.js 15.4.7 app directory structure:

```
xlsx-addin-remover/
├── app/                    # Next.js app directory (root level)
│   ├── api/               # API routes
│   │   ├── analyze-excel/ # Excel analysis endpoint
│   │   ├── process-excel/ # Excel processing endpoint
│   │   └── docs/          # API documentation
│   ├── docs/              # Documentation page
│   ├── __tests__/         # Component tests
│   ├── globals.css        # Global styles (Tailwind CSS v4)
│   ├── layout.tsx         # Root layout with Geist fonts
│   ├── page.tsx           # Main application page
│   └── favicon.ico        # App icon
├── lib/                   # Utility functions
│   ├── __tests__/         # Utility tests
│   └── excel-utils.ts     # Excel processing utilities
├── public/                # Static assets
├── file-examples/         # Example Excel files for testing
├── package.json           # Dependencies and scripts
├── next.config.ts         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── postcss.config.mjs     # PostCSS configuration (Tailwind v4)
├── jest.config.js         # Jest testing configuration
├── jest.setup.js          # Jest setup and mocks
└── README.md              # This file
```

## Key Changes Made

1. **Moved from `src/` to root-level structure**: The `app` directory is now at the root level, following Next.js 15 conventions
2. **Updated to Tailwind CSS v4**: Using the new `@tailwindcss/postcss` plugin
3. **Updated React to v18**: Compatible with swagger-ui-react and other dependencies
4. **Simplified Next.js config**: Removed complex webpack configurations
5. **Updated TypeScript paths**: Changed from `@/*` pointing to `src/*` to pointing to root
6. **Updated Jest configuration**: Modified to work with the new structure

## Features

- **File Upload**: Drag and drop or click to upload Excel (.xlsx) files
- **Addin Analysis**: Automatically detects and lists all addins in the uploaded file
- **Selective Removal**: Choose which addins to remove from the file
- **File Download**: Download the processed file with selected addins removed
- **API Documentation**: Built-in Swagger UI for API exploration
- **Error Handling**: Comprehensive error handling and user feedback

## Technology Stack

- **Next.js 15.4.7**: React framework with App Router
- **React 18.3.1**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS v4**: Styling
- **Jest**: Testing framework
- **adm-zip**: Excel file processing
- **Swagger UI**: API documentation

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

The project is configured for deployment on Vercel with the following optimizations:

- **Turbopack**: Enabled for faster development builds
- **App Router**: Using Next.js 15 App Router for better performance
- **Static Generation**: Pages are pre-rendered where possible
- **API Routes**: Serverless functions for file processing

## API Endpoints

- `POST /api/analyze-excel`: Analyze Excel file and return addin information
- `POST /api/process-excel`: Process Excel file and remove selected addins
- `GET /api/docs`: API documentation (Swagger UI)

## Testing

The project includes comprehensive tests:

- **Unit Tests**: For utility functions in `lib/excel-utils.ts`
- **Component Tests**: For React components
- **API Tests**: For API endpoints
- **Integration Tests**: For file processing workflows

## File Processing

The application can handle Excel files with the following addin types:
- Web Extensions (Office Add-ins)
- COM Add-ins
- Excel Add-ins

The processing involves:
1. Unpacking the Excel file (ZIP format)
2. Parsing XML files to identify addins
3. Removing selected addins and updating references
4. Repacking the file for download

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
