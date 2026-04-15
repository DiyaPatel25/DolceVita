import DataAccess from './config/dataAccess.js';
import { connectDB, isMongoDBConnected } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

// Manual data migration utility
async function migrateAllData() {
  console.log('Starting data migration...');
  
  // Connect to MongoDB
  await connectDB();
  
  if (!isMongoDBConnected()) {
    console.log('❌ MongoDB not available. Cannot migrate data.');
    return;
  }
  
  console.log('✅ MongoDB connected. Starting migration...');
  
  const models = ['User', 'Category', 'Menu', 'Cart', 'Order', 'Booking'];
  
  for (const model of models) {
    console.log(`\n📋 Migrating ${model} data...`);
    
    try {
      const dataAccess = new DataAccess(model);
      await dataAccess.migrateToMongoDB();
      console.log(`✅ ${model} migration completed`);
    } catch (error) {
      console.log(`❌ Error migrating ${model}:`, error.message);
    }
  }
  
  console.log('\n🎉 Migration process completed!');
  process.exit(0);
}

// Run migration if called directly
if (process.argv[2] === 'migrate') {
  migrateAllData().catch(console.error);
} else {
  console.log(`
📋 Data Migration Utility

Usage:
  node migrate.js migrate    - Migrate all local data to MongoDB

Before running:
  1. Ensure MONGO_URL is set in .env file
  2. Ensure MongoDB is running and accessible
  3. Backup your local data files if needed (backend/data/*.json)

This will:
  ✅ Connect to MongoDB
  ✅ Read all local JSON files
  ✅ Insert data into MongoDB (skips duplicates)
  ✅ Preserve local files for safety
  `);
}

export { migrateAllData };