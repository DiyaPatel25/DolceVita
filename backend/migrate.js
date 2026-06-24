import { connectDB, isMongoDBConnected } from './config/db.js';
import dotenv from 'dotenv';
import LocalStorage from './config/localStorage.js';

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
  
  const categoryMap = {}; // local_id -> mongo_ObjectId
  const userMap = {};      // local_id -> mongo_ObjectId
  const menuItemMap = {};  // local_id -> mongo_ObjectId
  
  try {
    // 1. Migrate Categories
    console.log('\n📋 Migrating Categories...');
    const Category = (await import('./models/categoryModel.js')).default;
    const localCategoriesStore = new LocalStorage('categories');
    const localCategories = localCategoriesStore.find();
    
    for (const cat of localCategories) {
      let mongoCat = await Category.findOne({ name: cat.name });
      if (!mongoCat) {
        mongoCat = await Category.create({
          name: cat.name,
          image: cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
        });
        console.log(`Created category: ${cat.name}`);
      }
      categoryMap[cat._id] = mongoCat._id;
    }
    
    // Also scan menus.json for categories if localCategories was empty
    const localMenusStore = new LocalStorage('menus');
    const localMenus = localMenusStore.find();
    for (const menu of localMenus) {
      if (menu.category && typeof menu.category === 'object' && menu.category.name) {
        const catId = menu.category._id || 'desserts_cat';
        const catName = menu.category.name;
        if (!categoryMap[catId]) {
          let mongoCat = await Category.findOne({ name: catName });
          if (!mongoCat) {
            mongoCat = await Category.create({
              name: catName,
              image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
            });
            console.log(`Created category from menu item: ${catName}`);
          }
          categoryMap[catId] = mongoCat._id;
        }
      } else if (menu.category && typeof menu.category === 'string') {
        const catId = menu.category;
        if (!categoryMap[catId]) {
          let catName = 'Desserts';
          if (catId.toLowerCase().includes('pizza')) catName = 'Pizza';
          if (catId.toLowerCase().includes('pasta')) catName = 'Pasta';
          if (catId.toLowerCase().includes('beverage')) catName = 'Beverages';
          
          let mongoCat = await Category.findOne({ name: catName });
          if (!mongoCat) {
            mongoCat = await Category.create({
              name: catName,
              image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
            });
            console.log(`Created category from string reference: ${catName}`);
          }
          categoryMap[catId] = mongoCat._id;
        }
      }
    }
    
    // 2. Migrate Users
    console.log('\n📋 Migrating Users...');
    const User = (await import('./models/userModel.js')).default;
    const localUsersStore = new LocalStorage('users');
    const localUsers = localUsersStore.find();
    
    for (const user of localUsers) {
      let mongoUser = await User.findOne({ email: user.email });
      if (!mongoUser) {
        const { _id, createdAt, updatedAt, ...userData } = user;
        mongoUser = await User.create(userData);
        console.log(`Created user: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
      userMap[user._id] = mongoUser._id;
    }
    
    // 3. Migrate Menu items
    console.log('\n📋 Migrating Menu...');
    const Menu = (await import('./models/menuModel.js')).default;
    
    for (const item of localMenus) {
      let mongoItem = await Menu.findOne({ name: item.name });
      if (!mongoItem) {
        const { _id, createdAt, updatedAt, category, ...itemData } = item;
        
        let resolvedCategoryId;
        if (category && typeof category === 'object') {
          resolvedCategoryId = categoryMap[category._id];
        } else if (category && typeof category === 'string') {
          resolvedCategoryId = categoryMap[category];
        }
        
        if (!resolvedCategoryId) {
          const firstCat = await Category.findOne();
          resolvedCategoryId = firstCat ? firstCat._id : null;
        }
        
        if (!resolvedCategoryId) {
          console.log(`⚠️ Skipping item "${item.name}": Category not found/created`);
          continue;
        }
        
        if (typeof itemData.price === 'string') {
          itemData.price = parseFloat(itemData.price) || 0;
        }
        
        mongoItem = await Menu.create({
          ...itemData,
          category: resolvedCategoryId
        });
        console.log(`Created menu item: ${item.name}`);
      } else {
        console.log(`Menu item already exists: ${item.name}`);
      }
      menuItemMap[item._id] = mongoItem._id;
    }
    
    // 4. Migrate Carts
    console.log('\n📋 Migrating Carts...');
    const Cart = (await import('./models/cartModel.js')).default;
    const localCartsStore = new LocalStorage('carts');
    const localCarts = localCartsStore.find();
    
    for (const cart of localCarts) {
      const mongoUserId = userMap[cart.user];
      if (!mongoUserId) {
        console.log(`⚠️ Skipping cart: User ${cart.user} not found in migrated users`);
        continue;
      }
      
      let mongoCart = await Cart.findOne({ user: mongoUserId });
      if (!mongoCart) {
        const migratedItems = [];
        for (const item of cart.items) {
          let localMenuItemId = item.menuItem && typeof item.menuItem === 'object' ? item.menuItem._id : item.menuItem;
          const mongoMenuItemId = menuItemMap[localMenuItemId];
          if (mongoMenuItemId) {
            migratedItems.push({
              menuItem: mongoMenuItemId,
              quantity: item.quantity || 1,
              customizations: item.customizations || {}
            });
          }
        }
        
        if (migratedItems.length > 0) {
          await Cart.create({
            user: mongoUserId,
            items: migratedItems
          });
          console.log(`Created cart for user: ${mongoUserId}`);
        }
      } else {
        console.log(`Cart already exists for user: ${mongoUserId}`);
      }
    }
    
    // 5. Migrate Orders
    console.log('\n📋 Migrating Orders...');
    const Order = (await import('./models/orderModel.js')).default;
    const localOrdersStore = new LocalStorage('orders');
    const localOrders = localOrdersStore.find();
    
    for (const order of localOrders) {
      const mongoUserId = userMap[order.user];
      if (!mongoUserId) {
        console.log(`⚠️ Skipping order: User ${order.user} not found in migrated users`);
        continue;
      }
      
      const existingOrder = await Order.findOne({ 
        user: mongoUserId, 
        totalAmount: order.totalAmount,
        address: order.address
      });
      
      if (!existingOrder) {
        const migratedItems = [];
        for (const item of order.items) {
          let localMenuItemId = item.menuItem && typeof item.menuItem === 'object' ? item.menuItem._id : item.menuItem;
          const mongoMenuItemId = menuItemMap[localMenuItemId];
          if (mongoMenuItemId) {
            migratedItems.push({
              menuItem: mongoMenuItemId,
              quantity: item.quantity || 1,
              customizations: item.customizations || {}
            });
          }
        }
        
        if (migratedItems.length > 0) {
          await Order.create({
            user: mongoUserId,
            items: migratedItems,
            totalAmount: order.totalAmount,
            orderType: order.orderType || 'Pickup',
            address: order.address || 'Pickup at Counter',
            status: order.status || 'Pending',
            paymentMethod: order.paymentMethod || 'Pay at Counter',
            paymentStatus: order.paymentStatus || 'Pending'
          });
          console.log(`Created order for user: ${mongoUserId}`);
        }
      } else {
        console.log(`Order already exists for user: ${mongoUserId}`);
      }
    }
    
    // 6. Migrate Bookings
    console.log('\n📋 Migrating Bookings...');
    const Booking = (await import('./models/bookingModel.js')).default;
    const localBookingsStore = new LocalStorage('bookings');
    const localBookings = localBookingsStore.find();
    
    for (const booking of localBookings) {
      let mongoUserId = userMap[booking.user];
      
      if (!mongoUserId && booking.email) {
        const foundUser = await User.findOne({ email: booking.email });
        if (foundUser) {
          mongoUserId = foundUser._id;
        }
      }
      
      if (!mongoUserId) {
        let guestUser = await User.findOne({ email: 'guest@dolcevita.com' });
        if (!guestUser) {
          guestUser = await User.create({
            name: 'Guest User',
            email: 'guest@dolcevita.com',
            password: 'GuestTemporaryPassword123!',
            isAdmin: false
          });
          console.log(`Created temporary guest user for guest bookings`);
        }
        mongoUserId = guestUser._id;
      }
      
      const existingBooking = await Booking.findOne({
        user: mongoUserId,
        date: booking.date,
        time: booking.time
      });
      
      if (!existingBooking) {
        await Booking.create({
          user: mongoUserId,
          name: booking.name,
          phone: booking.phone,
          numberOfPeople: parseInt(booking.numberOfPeople) || 1,
          date: booking.date,
          time: booking.time,
          note: booking.note || '',
          status: booking.status || 'Pending'
        });
        console.log(`Created booking for: ${booking.name} (${booking.date} at ${booking.time})`);
      } else {
        console.log(`Booking already exists for: ${booking.name}`);
      }
    }
    
    console.log('\n🎉 Relational Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.log('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (process.argv[2] === 'migrate') {
  migrateAllData().catch(console.error);
} else {
  console.log(`
📋 Relational Data Migration Utility

Usage:
  node migrate.js migrate    - Migrate all local data to MongoDB

This will:
  ✅ Resolve local text IDs into valid Mongoose ObjectIds
  ✅ Link bookings, orders, and carts properly
  ✅ Auto-create dessert and other categories
  ✅ Gracefully handle missing references
  `);
}

export { migrateAllData };