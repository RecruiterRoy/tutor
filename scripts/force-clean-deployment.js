#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Force Clean Deployment Script');
console.log('================================');

// Remove dist folder if it exists
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
    console.log('📁 Removing dist folder...');
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('✅ Dist folder removed');
} else {
    console.log('📁 Dist folder not found, skipping...');
}

// Update vercel.json with timestamp to force rebuild
const vercelPath = path.join(process.cwd(), 'vercel.json');
if (fs.existsSync(vercelPath)) {
    console.log('⚙️ Updating vercel.json timestamp...');
    const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    vercelConfig.comment = `Forced rebuild: ${new Date().toISOString()}`;
    fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2));
    console.log('✅ Vercel.json updated');
}

// Create a deployment marker file
const markerContent = `# Deployment Marker
This file forces a fresh deployment.
Timestamp: ${new Date().toISOString()}
Action: Remove BPL/APL content, deploy updated index.html
`;

fs.writeFileSync('.deploy-marker', markerContent);
console.log('✅ Deployment marker created');

console.log('\n🚀 Ready for fresh deployment!');
console.log('Run: git add . && git commit -m "Force clean deployment" && git push'); 