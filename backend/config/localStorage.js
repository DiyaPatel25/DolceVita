import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base directory for local data storage
const DATA_DIR = path.join(__dirname, "..", "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class LocalStorage {
  constructor(collection) {
    this.collection = collection;
    this.filePath = path.join(DATA_DIR, `${collection}.json`);
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.log(`Error loading ${this.collection} data:`, error);
      return [];
    }
  }

  saveData() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.log(`Error saving ${this.collection} data:`, error);
    }
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  create(document) {
    const newDoc = {
      ...document,
      _id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.push(newDoc);
    this.saveData();
    return newDoc;
  }

  findOne(query) {
    return this.data.find(doc => {
      return Object.keys(query).every(key => {
        if (key === '_id') return doc._id === query._id;
        return doc[key] === query[key];
      });
    });
  }

  find(query = {}) {
    if (Object.keys(query).length === 0) {
      return this.data;
    }
    return this.data.filter(doc => {
      return Object.keys(query).every(key => {
        return doc[key] === query[key];
      });
    });
  }

  findById(id) {
    return this.data.find(doc => doc._id === id);
  }

  findByIdAndUpdate(id, update) {
    const index = this.data.findIndex(doc => doc._id === id);
    if (index !== -1) {
      this.data[index] = {
        ...this.data[index],
        ...update,
        updatedAt: new Date()
      };
      this.saveData();
      return this.data[index];
    }
    return null;
  }

  findByIdAndDelete(id) {
    const index = this.data.findIndex(doc => doc._id === id);
    if (index !== -1) {
      const deletedDoc = this.data.splice(index, 1)[0];
      this.saveData();
      return deletedDoc;
    }
    return null;
  }

  deleteMany(query) {
    const initialLength = this.data.length;
    this.data = this.data.filter(doc => {
      return !Object.keys(query).every(key => {
        return doc[key] === query[key];
      });
    });
    const deletedCount = initialLength - this.data.length;
    if (deletedCount > 0) {
      this.saveData();
    }
    return { deletedCount };
  }
}

export default LocalStorage;