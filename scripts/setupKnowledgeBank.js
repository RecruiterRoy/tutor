#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧠 Setting up Knowledge Bank System...\n');
console.log('=' .repeat(60) + '\n');

try {
  // Step 1: Create knowledge bank
  console.log('📚 Step 1: Creating knowledge bank...');
  execSync('node scripts/createKnowledgeBank.js', { 
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });
  
  console.log('\n✅ Knowledge bank created successfully!\n');
  
  // Step 2: Test the system
  console.log('🧪 Step 2: Testing knowledge bank system...');
  execSync('node scripts/testKnowledgeBank.js', { 
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });
  
  console.log('\n🎉 Knowledge Bank System Setup Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Test the AI chat with knowledge bank integration');
  console.log('3. The AI will now search your educational content first');
  console.log('4. Check the dashboard for improved responses with book references');
  
} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('- Make sure all dependencies are installed: npm install');
  console.log('- Check that your Supabase storage has educational content');
  console.log('- Verify your Supabase credentials are correct');
} 