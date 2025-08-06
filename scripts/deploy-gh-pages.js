#!/usr/bin/env node

/**
 * GitHub Pages Deployment Script
 * 
 * This script helps with deploying to GitHub Pages by:
 * 1. Building the project for GitHub Pages
 * 2. Providing instructions for manual deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 GitHub Pages Deployment Script\n');

try {
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    console.error('❌ Error: package.json not found. Please run this script from the project root.');
    process.exit(1);
  }

  console.log('📦 Building project for GitHub Pages...');
  
  // Build the project
  execSync('npm run build:gh-pages', { stdio: 'inherit' });
  
  console.log('\n✅ Build completed successfully!');
  console.log('\n📁 Built files are in the dist/client/ directory');
  
  // Check if 404.html exists
  if (fs.existsSync('dist/client/404.html')) {
    console.log('✅ 404.html file found - routing should work correctly');
  } else {
    console.log('⚠️  404.html file not found - routing may not work correctly');
  }
  
  console.log('\n🌐 Next steps:');
  console.log('1. Go to your GitHub repository');
  console.log('2. Navigate to Settings → Pages');
  console.log('3. Source: "GitHub Actions" (recommended) or "Deploy from a branch"');
  console.log('4. If using branch deployment, upload contents of dist/client/ to gh-pages branch');
  console.log('5. Your site will be available at: https://your-username.github.io/INSY7314_ReactFrontEnd/');
  
  console.log('\n📋 For automatic deployment:');
  console.log('- Push your changes to the main branch');
  console.log('- GitHub Actions will automatically build and deploy');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 