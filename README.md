# ShopSync

<div align="center">

## MERN Stack E-Commerce Platform

A modern full-stack e-commerce application built using the MERN stack, providing a seamless shopping experience with secure authentication, product management, real-time order updates, wishlist functionality, and an intuitive user interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-black?logo=socketdotio)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

# Table of Contents

- Overview
- Features
- Technology Stack
- Project Structure
- Installation
- Configuration
- Running the Application
- API Modules
- Future Enhancements
- Author
- License

---

# Overview

ShopSync is a full-stack e-commerce platform developed using the MERN stack. The application enables users to browse products, manage wishlists, place orders, manage delivery addresses, and securely authenticate.

It also includes an administrative module for managing products, categories, filters, and orders while supporting real-time updates through Socket.IO.

---

# Features

## User Features

- User Registration & Login
- Secure Authentication
- Product Browsing
- Product Search & Filtering
- Category-wise Products
- Wishlist Management
- Shopping Cart
- Order Placement
- Address Management
- Order History
- Responsive User Interface

## Admin Features

- Admin Authentication
- Product Management
- Category Management
- Order Management
- Product Filtering
- Dashboard Management

## Real-Time Features

- Real-time Order Updates
- Socket.IO Integration
- Instant Notifications

---

# Technology Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | React 19, Vite, Material UI, React Router, Axios, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Real-Time | Socket.IO |
| Development Tools | ESLint, Nodemon |

---

# Project Structure

```
ShopSync/

├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── pages/
│   └── App.jsx
│
├── package.json
└── README.md
```

---

# Installation

## Clone the Repository

```bash
git clone https://github.com/yourusername/ShopSync.git

cd ShopSync
```

---

## Install Frontend Dependencies

```bash
npm install
```

---

## Install Backend Dependencies

```bash
cd backend

npm install
```

---

# Configuration

Create a `.env` file inside the **backend** directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

# Running the Application

### Start Backend

```bash
cd backend

npm run dev
```

### Start Frontend

```bash
npm run dev
```

Open the application at:

```
http://localhost:5173
```

---

# API Modules

| Module | Description |
|---------|-------------|
| Authentication | User & Admin Login |
| Products | Product Management |
| Categories | Category Management |
| Orders | Order Processing |
| Addresses | User Address Management |
| Wishlist | Wishlist Operations |
| Filters | Product Filtering |
| Admin | Administrative Operations |

---

# Screenshots

Add screenshots inside a **screenshots/** folder.

Example:

```
screenshots/

home.png

products.png

product-details.png

wishlist.png

cart.png

checkout.png

admin-dashboard.png
```

---

# Future Enhancements

- Online Payment Gateway Integration
- Product Reviews & Ratings
- Inventory Management
- Email Notifications
- Order Tracking
- Coupon & Discount System
- AI Product Recommendations
- Mobile Application
- Analytics Dashboard
- Multi-Vendor Support

---

# Author

**Driswin Kumar K**

MERN Stack Developer

---

# License

This project is licensed under the MIT License.

---

<div align="center">

Built using the MERN Stack to deliver a modern, scalable, and responsive e-commerce experience.

</div>
