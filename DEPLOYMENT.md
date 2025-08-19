# Deployment Guide

This guide covers deploying the Excel Addin Remover webapp to various platforms.

## Prerequisites

- Node.js 18+ installed
- Git repository access
- Platform-specific accounts (Vercel, Netlify, etc.)

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Test the application:**
   ```bash
   npm run test-api
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the easiest platform for Next.js applications.

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project or create new
   - Set project name
   - Confirm deployment settings

4. **Environment Variables (if needed):**
   - Go to Vercel dashboard
   - Navigate to your project
   - Go to Settings > Environment Variables
   - Add any required environment variables

### 2. Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=out
   ```

3. **Or deploy via Netlify UI:**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `out`

### 3. Railway

1. **Connect your repository to Railway**
2. **Set build command:**
   ```bash
   npm install && npm run build
   ```
3. **Set start command:**
   ```bash
   npm start
   ```

### 4. Docker Deployment

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Build and run:**
   ```bash
   docker build -t excel-addin-remover .
   docker run -p 3000:3000 excel-addin-remover
   ```

### 5. Traditional Server Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Install PM2 for process management:**
   ```bash
   npm install -g pm2
   ```

3. **Start the application:**
   ```bash
   pm2 start npm --name "excel-addin-remover" -- start
   ```

4. **Set up reverse proxy (Nginx example):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Environment Variables

Create a `.env.local` file for local development:

```env
# Optional: Set custom port
PORT=3000

# Optional: Set API base URL for production
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
```

## Production Considerations

### 1. File Upload Limits

The application handles Excel files. Consider setting appropriate limits:

- **Vercel:** 100MB limit for hobby plan, 500MB for pro
- **Netlify:** 100MB limit
- **Railway:** Configurable via environment variables

### 2. Temporary File Storage

The app creates temporary files during processing. Ensure:

- Adequate disk space
- Proper cleanup (handled automatically)
- Consider using cloud storage for large files

### 3. Security

- The app only accepts `.xlsx` files
- File validation is implemented
- Temporary files are cleaned up automatically

### 4. Performance

- Files are processed in memory where possible
- Temporary directories are cleaned up after processing
- Consider implementing file size limits for better performance

## Monitoring and Logs

### Vercel
- Built-in analytics and monitoring
- Function logs available in dashboard
- Performance insights included

### Netlify
- Function logs in dashboard
- Analytics available with paid plans

### Railway
- Real-time logs in dashboard
- Performance monitoring included

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change port in package.json scripts
   - Use `PORT=3001 npm run dev`

2. **File upload fails:**
   - Check file size limits
   - Verify file is valid .xlsx
   - Check server logs for errors

3. **API endpoints not working:**
   - Verify server is running
   - Check network connectivity
   - Review API documentation at `/docs`

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

## Support

For deployment issues:

1. Check platform-specific documentation
2. Review application logs
3. Test locally first
4. Open an issue in the repository

## Updates and Maintenance

1. **Regular updates:**
   ```bash
   npm update
   npm audit fix
   ```

2. **Security patches:**
   - Monitor npm audit reports
   - Update dependencies regularly

3. **Backup strategy:**
   - Version control for code
   - Database backups if applicable
   - Configuration backups
