import mongoose from 'mongoose';
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
  User:     new LocalStorage('users'),
  Category: new LocalStorage('categories'),
  Menu:     new LocalStorage('menus'),
  Cart:     new LocalStorage('carts'),
  Order:    new LocalStorage('orders'),
  Booking:  new LocalStorage('bookings')
};

class DataAccess {
  constructor(modelName) {
    this.modelName = modelName;
    this.mongoModel = modelMap[modelName];
    this.localStorage = localStorageMap[modelName];
  }

  isQueryInvalid(query) {
    if (!query || typeof query !== 'object') return false;
    
    const objectIdFields = ['_id', 'user', 'category', 'menuItem'];
    
    for (const key of Object.keys(query)) {
      const val = query[key];
      if (objectIdFields.includes(key)) {
        if (val && typeof val === 'string' && !mongoose.Types.ObjectId.isValid(val)) {
          return true;
        }
      } else if (typeof val === 'object' && val !== null) {
        if (this.isQueryInvalid(val)) return true;
      }
    }
    return false;
  }

  async create(data) {
    if (isMongoDBConnected()) return await this.mongoModel.create(data);
    return this.localStorage.create(data);
  }

  async findOne(query) {
    if (isMongoDBConnected()) {
      if (this.isQueryInvalid(query)) return null;
      return await this.mongoModel.findOne(query);
    }
    return this.localStorage.findOne(query);
  }

  async find(query = {}) {
    if (isMongoDBConnected()) {
      if (this.isQueryInvalid(query)) return [];
      return await this.mongoModel.find(query);
    }
    return this.localStorage.find(query);
  }

  async findById(id) {
    if (isMongoDBConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await this.mongoModel.findById(id);
    }
    return this.localStorage.findById(id);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    if (isMongoDBConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await this.mongoModel.findByIdAndUpdate(id, update, { new: true, ...options });
    }
    return this.localStorage.findByIdAndUpdate(id, update);
  }

  async findByIdAndDelete(id) {
    if (isMongoDBConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await this.mongoModel.findByIdAndDelete(id);
    }
    return this.localStorage.findByIdAndDelete(id);
  }

  async deleteMany(query) {
    if (isMongoDBConnected()) {
      if (this.isQueryInvalid(query)) return { deletedCount: 0 };
      return await this.mongoModel.deleteMany(query);
    }
    return this.localStorage.deleteMany(query);
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