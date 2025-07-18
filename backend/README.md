# HealthMeet Backend

This is the Node.js/Express backend API for HealthMeet.

## Setup

```sh
npm install
node server.js
```

## Environment Variables
- `MONGODB_URL`: MongoDB connection string
- `CLOUDINARY_URL`: Cloudinary config (if used)
- Any other secrets required by your app

## Features
- REST API for users, doctors, appointments
- JWT authentication for users, doctors, and admins
- File uploads (multer, cloudinary)

## Deployment
- Deploy to Render, Railway, or Cyclic for persistent backend hosting 