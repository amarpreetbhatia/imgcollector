#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting VisualCraft Studio Vercel Build...');

try {
  // Install server dependencies
  console.log('📦 Installing server dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });

  // Build React application
  console.log('🏗️ Building React application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Copy server files to build directory for serverless functions
  console.log('📁 Preparing serverless functions...');
  const serverPath = path.join(__dirname, '..', 'server');
  const buildPath = path.join(__dirname, '..', 'build');
  
  // Ensure build directory exists
  if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath, { recursive: true });
  }

  // Create serverless function package.json
  const serverlessPackage = {
    name: 'visualcraft-studio-api',
    version: '1.0.0',
    main: 'index.js',
    dependencies: {
      'axios': '^1.6.0',
      'cheerio': '^1.0.0-rc.12',
      'robots-parser': '^3.0.1',
      '@google/generative-ai': '^0.1.3',
      'multer': '^1.4.5',
      'sharp': '^0.32.6'
    }
  };

  fs.writeFileSync(
    path.join(buildPath, 'package.json'),
    JSON.stringify(serverlessPackage, null, 2)
  );

  console.log('✅ Build completed successfully!');
  console.log('🎯 Ready for Vercel deployment');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}