import { isMongoDBConnected } from './db.js';
import LocalStorage from './localStorage.js';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import Menu from '../models/menuModel.js';
import Cart from '../models/cartModel.js';
import Order from '../models/orderModel.js';

const modelMap = { User, Category, Menu, Cart, Order };
const localStorageMap = {
  User:     new LocalStorage('users'),
  Category: new LocalStorage('categories'),
  Menu:     new LocalStorage('menus'),
  Cart:     new LocalStorage('carts'),
  Order:    new LocalStorage('orders'),
};

class DataAccess {
  constructor(modelName) {
    this.modelName = modelName;
    this.mongoModel = modelMap[modelName];
    this.localStorage = localStorageMap[modelName];
  }

  async create(data) {
    if (isMongoDBConnected()) return await this.mongoModel.create(data);
    return this.localStorage.create(data);
  }

  async findOne(query) {
    if (isMongoDBConnected()) return await this.mongoModel.findOne(query);
    return this.localStorage.findOne(query);
  }

  async find(query = {}) {
    if (isMongoDBConnected()) return await this.mongoModel.find(query);
    return this.localStorage.find(query);
  }

  async findById(id) {
    if (isMongoDBConnected()) return await this.mongoModel.findById(id);
    return this.localStorage.findById(id);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    if (isMongoDBConnected()) return await this.mongoModel.findByIdAndUpdate(id, update, { new: true, ...options });
    return this.localStorage.findByIdAndUpdate(id, update);
  }

  async findByIdAndDelete(id) {
    if (isMongoDBConnected()) return await this.mongoModel.findByIdAndDelete(id);
    return this.localStorage.findByIdAndDelete(id);
  }

  async deleteMany(query) {
    if (isMongoDBConnected()) return await this.mongoModel.deleteMany(query);
    return this.localStorage.deleteMany(query);
  }
}

export default DataAccess;