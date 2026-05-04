#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Run this before deploying: node pre-deploy-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 DROPBOX MUSIC PLAYER - Pre-Deployment Check\n');

const checks = [
  {
    name: 'package.json exists and valid',
    check: () => {
      try {
        const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        return pkg.main === 'server.js' || true;
      } catch (e) {
        return false;
      }
    }
  },
  {
    name: 'server.js exists',
    check: () => fs.existsSync('./server.js')
  },
  {
    name: 'All HTML files present',
    check: () => {
      const files = [
        'index.html', 'login.html', 'register.html', 'discover.html',
        'playlists.html', 'artist-profile.html', 'user-profile.html',
        'settings.html', 'admin-dashboard.html', 'about.html'
      ];
      return files.every(f => 
        fs.existsSync(`./public/${f}`) || fs.existsSync(`./${f}`)
      );
    }
  },
  {
    name: 'styles.css exists',
    check: () => fs.existsSync('./public/styles.css') || fs.existsSync('./styles.css')
  },
  {
    name: 'app.js exists',
    check: () => fs.existsSync('./app.js')
  },
  {
    name: 'Dockerfile exists',
    check: () => fs.existsSync('./Dockerfile')
  },
  {
    name: 'Procfile exists (for Heroku)',
    check: () => fs.existsSync('./Procfile')
  },
  {
    name: 'node_modules directory exists',
    check: () => fs.existsSync('./node_modules')
  },
  {
    name: '.env file exists',
    check: () => fs.existsSync('./.env')
  },
  {
    name: 'API_DOCUMENTATION.md exists',
    check: () => fs.existsSync('./API_DOCUMENTATION.md')
  }
];

let passed = 0;
let failed = 0;

checks.forEach(({ name, check }) => {
  const result = check();
  const icon = result ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (result) passed++;
  else failed++;
});

console.log(`\n📊 Results: ${passed}/${checks.length} passed\n`);

// Check for sensitive files
console.log('🔐 Checking for sensitive files...\n');
const sensitivePatterns = [
  /\.env\.production/,
  /aws_credentials/,
  /\.pem$/,
  /private_key/
];

const currentDir = fs.readdirSync('.');
const foundSensitive = currentDir.filter(file => 
  sensitivePatterns.some(pattern => pattern.test(file))
);

if (foundSensitive.length > 0) {
  console.log('⚠️  Sensitive files found:');
  foundSensitive.forEach(f => console.log(`  - ${f}`));
  console.log('  Make sure these are in .gitignore!\n');
} else {
  console.log('✅ No sensitive files detected\n');
}

if (failed === 0) {
  console.log('🚀 ✅ Project is ready for deployment!\n');
  console.log('Next steps:');
  console.log('1. Configure MONGODB_URI in deployment platform');
  console.log('2. Set JWT_SECRET to a strong random string');
  console.log('3. Deploy using: git push heroku main (or your platform)');
  console.log('4. Verify with: curl https://your-app.herokuapp.com/api/health\n');
  process.exit(0);
} else {
  console.log(`❌ ${failed} check(s) failed. Fix these before deploying.\n`);
  process.exit(1);
}
