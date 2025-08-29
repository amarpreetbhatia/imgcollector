const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Image Crawler App...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required');
  console.error(`Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

try {
  // Install frontend dependencies
  console.log('📦 Installing frontend dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Install backend dependencies
  console.log('📦 Installing backend dependencies...');
  if (!fs.existsSync(path.join(__dirname, 'server'))) {
    console.error('❌ Server directory not found');
    process.exit(1);
  }
  
  execSync('npm install', { 
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit' 
  });

  console.log('\n✅ Setup complete!');
  console.log('\n🎉 You can now start the application with:');
  console.log('   npm run dev');
  console.log('\nOr start servers separately:');
  console.log('   npm run server:dev  (backend)');
  console.log('   npm start           (frontend)');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}