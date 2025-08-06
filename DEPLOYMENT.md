# Deployment Guide

This guide covers deploying the SecurePay application to GitHub Pages.

## GitHub Pages Deployment

### Prerequisites

- GitHub repository with the code
- GitHub account with Pages enabled
- Node.js 18+ installed locally (for testing builds)

### Automatic Deployment (Recommended)

1. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - This will use the workflow in `.github/workflows/deploy.yml`

2. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

3. **Monitor deployment**:
   - Go to Actions tab in your repository
   - Watch the "Deploy to GitHub Pages" workflow
   - The site will be available at: `https://your-username.github.io/INSY7314_ReactFrontEnd/`

### Manual Deployment

If you prefer manual deployment:

1. **Build the project**:
   ```bash
   npm run build:gh-pages
   ```

2. **Upload to GitHub Pages**:
   - Go to Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `gh-pages` (create this branch)
   - Folder: `/ (root)`
   - Upload the contents of the `dist/` folder to the `gh-pages` branch

### Custom Domain

To use a custom domain:

1. **Add custom domain**:
   - Go to Settings → Pages
   - Add your domain in the "Custom domain" field
   - Save the changes

2. **Update Vite config** (if needed):
   ```typescript
   // vite.config.gh-pages.ts
   base: '/',
   ```

3. **DNS Configuration**:
   - Add a CNAME record pointing to `your-username.github.io`
   - Or add A records pointing to GitHub Pages IP addresses

### Troubleshooting

#### Build Failures

1. **Check Node.js version**:
   - Ensure you're using Node.js 18+
   - The GitHub Actions workflow uses Node.js 18

2. **Check dependencies**:
   ```bash
   npm ci
   npm run build:gh-pages
   ```

3. **Check for TypeScript errors**:
   ```bash
   npm run check
   ```

#### Routing Issues

The application includes special handling for GitHub Pages routing:

- `public/404.html` - Handles client-side routing
- `index.html` - Includes routing script
- These files ensure React Router works correctly on GitHub Pages

#### Base URL Issues

If you change the repository name, update the base URL in `vite.config.ts`:

```typescript
base: process.env.NODE_ENV === 'production' ? '/NEW_REPO_NAME/' : '/',
```

### Environment Variables

For GitHub Pages, you may need to set environment variables in the GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
- name: Build
  run: npm run build:gh-pages
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
```

### Security Considerations

- GitHub Pages serves static files only
- No server-side processing
- API calls will go to your Cloudflare Workers backend
- Ensure CORS is properly configured on your backend

### Performance Optimization

The build process includes:

- Code splitting for better loading performance
- Asset optimization
- Tree shaking to reduce bundle size
- Compression for faster loading

### Monitoring

- Check GitHub Actions for build status
- Monitor GitHub Pages analytics (if enabled)
- Use browser dev tools to check for errors
- Test all routes work correctly after deployment 