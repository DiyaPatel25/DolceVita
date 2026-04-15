import { isMongoDBConnected } from './db.js';
import LocalStorage from './localStorage.js';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import Menu from '../models/menuModel.js';
import Cart from '../models/cartModel.js';
import Order from '../models/orderModel.js';
import Booking from '../models/bookingModel.js';

// Model mapping
const modelMap = {
  User,
  Category,
  Menu,
  Cart,
  Order,
  Booking
};

// Local storage instances
const localStorageMap = {
  User: new LocalStorage('users'),
  Category: new LocalStorage('categories'),
  Menu: new LocalStorage('menus'),
  Cart: new LocalStorage('carts'),
  Order: new LocalStorage('orders'),
  Booking: new LocalStorage('bookings')
};

class DataAccess {
  constructor(modelName) {
    this.modelName = modelName;
    this.mongoModel = modelMap[modelName];
    this.localStorage = localStorageMap[modelName];
  }

  async create(data) {
    if (isMongoDBConnected()) {
      return await this.mongoModel.create(data);
    } else {
      return this.localStorage.create(data);
    }
  }

  async findOne(query) {
    if (isMongoDBConnected()) {
      return await this.mongoModel.findOne(query);
    } else {
      return this.localStorage.findOne(query);
    }
  }

  async find(query = {}) {
    if (isMongoDBConnected()) {
      return await this.mongoModel.find(query);
    } else {
      return this.localStorage.find(query);
    }
  }

  async findById(id) {
    if (isMongoDBConnected()) {
      return await this.mongoModel.findById(id);
    } else {
      return this.localStorage.findById(id);
    }
  }

  async findByIdAndUpdate(id, update, options = {}) {
    if (isMongoDBConnected()) {
      return await this.mongoModel.findByIdAndUpdate(id, update, { new: true, ...options });
    } else {
      return this.localStorage.findByIdAndUpdate(id, update);
    }
  }

  async findByIdAndDelete(id) {
    if (isMongoDBConnected()) {
      return await this.mongoModel.findByIdAndDelete(id);
    } else {
      return this.localStorage.findByIdAndDelete(id);
    }
  }

  async deleteMany(query) {
    if (isMongoDBConnected()) {
      return await this.mongoModel.deleteMany(query);
    } else {
      return this.localStorage.deleteMany(query);
    }
  }

  // Method to migrate local data to MongoDB when connection is restored
  async migrateToMongoDB() {
    if (!isMongoDBConnected()) {
      console.log('MongoDB not connected, cannot migrate data');
      return;
    }

    const localData = this.localStorage.find();
    if (localData.length === 0) {
      console.log(`No local ${this.modelName} data to migrate`);
      return;
    }

    try {
      for (const doc of localData) {
        const { _id, createdAt, updatedAt, ...docData } = doc;
        
        // Check if document already exists in MongoDB
        const existing = await this.mongoModel.findOne({ 
          email: doc.email || undefined,
          name: doc.name || undefined 
        });
        
        if (!existing) {
          await this.mongoModel.create(docData);
          console.log(`Migrated ${this.modelName} document to MongoDB`);
        }
      }
      
      // Optionally clear local storage after successful migration
      // this.localStorage.data = [];
      // this.localStorage.saveData();
      
    } catch (error) {
      console.log(`Error migrating ${this.modelName} data to MongoDB:`, error);
    }
  }
}

export default DataAccess;