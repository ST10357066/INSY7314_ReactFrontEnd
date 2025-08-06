# GitHub Pages Setup - Quick Guide

## ✅ What's Been Added

1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
   - Automatically builds and deploys on push to main/master
   - Uses Node.js 18 and npm ci for reliable builds

2. **Vite Configuration Updates** 
   - `vite.config.ts` - Main config with Cloudflare plugin
   - `vite.config.gh-pages.ts` - GitHub Pages specific config (no Cloudflare plugin)
   - Added base URL for GitHub Pages: `/INSY7314_ReactFrontEnd/`
   - Configured for production builds

3. **Routing Support**
   - `public/404.html` - Handles client-side routing
   - Updated `index.html` with routing script
   - Ensures React Router works correctly

4. **Build Scripts** (`package.json`)
   - `npm run build:gh-pages` - Build for GitHub Pages
   - `npm run deploy:gh-pages` - Run deployment script
   - Added cross-env for cross-platform compatibility

5. **Documentation**
   - Updated README.md with deployment instructions
   - Created DEPLOYMENT.md with detailed guide
   - Created this quick setup guide

## 🚀 Quick Start

### 1. Enable GitHub Pages
- Go to your repository on GitHub
- Settings → Pages
- Source: "GitHub Actions"

### 2. Push Your Changes
```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

### 3. Monitor Deployment
- Go to Actions tab in your repository
- Watch the "Deploy to GitHub Pages" workflow
- Site will be available at: `https://your-username.github.io/INSY7314_ReactFrontEnd/`

## 🔧 Manual Deployment (if needed)

```bash
# Build for GitHub Pages
npm run build:gh-pages

# Run deployment script
npm run deploy:gh-pages
```

## 🌐 Custom Domain

If you want to use a custom domain:

1. Add domain in Settings → Pages
2. Update `vite.config.ts`:
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/' : '/',
   ```

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (18+ required)
- Run `npm ci` to clean install dependencies
- Check for TypeScript errors with `npm run check`

### Routing Doesn't Work
- Ensure `public/404.html` exists
- Check that `index.html` has the routing script
- Verify base URL in `vite.config.ts`

### Site Not Loading
- Check GitHub Actions for build status
- Verify Pages source is set to "GitHub Actions"
- Check repository settings for any errors

## 📞 Support

- Check the Actions tab for build logs
- Review DEPLOYMENT.md for detailed instructions
- Ensure all files are committed and pushed 