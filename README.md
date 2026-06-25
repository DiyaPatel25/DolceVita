# Dolce Vita

Dolce Vita is a modern web application for a restaurant/cafe, offering features like a dynamic menu, online ordering, cart management, payment integration, and a comprehensive admin dashboard for order and menu management.

## Project Structure

This project is organized as a monorepo containing both the frontend and backend applications.

- `/frontend`: React application built with Vite and TailwindCSS.
- `/backend`: Node.js/Express REST API serving the frontend and managing data.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Environment Variables

Before starting the application, you need to set up the environment variables.

1. Navigate to the `backend` directory.
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Fill in the necessary credentials in your `.env` file (e.g., JWT Secret, Cloudinary keys, Razorpay keys).

### Installation & Running

You can run both the frontend and backend concurrently from the root directory.

1. Install dependencies for root, frontend, and backend:
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   cd ..
   ```

2. Start the development servers:
   ```bash
   npm run dev
   ```

This will start the Vite frontend server (typically on http://localhost:5173) and the Express backend server (typically on http://localhost:5000).

## Features

- **Customer Facing:**
  - Browse dynamic menu with categories
  - Add to cart, adjust quantities, and customize items (e.g., extra cream, toppings)
  - Secure checkout with online payment (Razorpay) or Pay at Counter options
  - Order tracking and history
- **Admin Dashboard:**
  - Track real-time daily revenue, total orders, and top categories
  - Add and manage menu items with image uploads (Cloudinary)
  - Manage categories
  - View and update order statuses
  - Built-in POS (Point of Sale) system for taking counter orders

## Technologies Used

- **Frontend:** React, React Router, TailwindCSS, Lucide React, Axios, React Hot Toast
- **Backend:** Node.js, Express, JSON Web Token (JWT), Bcrypt, Multer, Cloudinary, Razorpay
- **Data Storage:** DataAccess wrapper supporting both local JSON file storage (default for easy setup) and MongoDB (if configured).

## License

All rights reserved.
