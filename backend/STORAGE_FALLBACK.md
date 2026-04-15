# MongoDB Fallback System

This backend now includes a fallback system that automatically switches between MongoDB and local file storage based on database availability.

## How it works

### Automatic Detection
- If `MONGO_URL` environment variable is set and MongoDB connection succeeds → Uses MongoDB
- If `MONGO_URL` is missing or connection fails → Uses local JSON file storage

### Data Storage Locations
When using local storage, data files are saved in:
- `backend/data/users.json` - User accounts and authentication
- `backend/data/categories.json` - Food categories
- `backend/data/menus.json` - Menu items
- `backend/data/carts.json` - Shopping carts
- `backend/data/orders.json` - Order history
- `backend/data/bookings.json` - Table reservations

### Current Storage Status
Check which storage system is active:
```
GET /api/storage-info
```

Response:
```json
{
  "usingMongoDB": true/false,
  "storageType": "MongoDB" or "Local File Storage"
}
```

### Data Migration
When MongoDB becomes available after running on local storage:
- New data is automatically stored in MongoDB
- Existing local data can be migrated using the built-in migration system
- Migration runs automatically on server startup when MongoDB connection is restored

### Environment Variables
```env
# Optional - if missing or connection fails, uses local storage
MONGO_URL=mongodb://localhost:27017/restaurant-db

# Other required variables
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@restaurant.com
ADMIN_PASSWORD=adminpassword
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Benefits
- **Zero downtime**: Application works immediately without MongoDB setup
- **No data loss**: Local data is preserved and can be migrated later
- **Same API**: Frontend works identically regardless of storage backend
- **Automatic switching**: Seamlessly upgrades to MongoDB when available
- **Development friendly**: Start coding immediately without database setup

### Production Deployment
For production, simply:
1. Set up MongoDB
2. Add `MONGO_URL` environment variable  
3. Deploy - existing local data will be automatically migrated

The system is designed to be completely transparent to the frontend application.