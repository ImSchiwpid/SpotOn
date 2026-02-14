# 📡 SPOT-ON API Documentation

Complete API reference for the SPOT-ON Parking Platform.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in requests:

**Header:**
```
Authorization: Bearer <your-jwt-token>
```

**Or Cookie:**
```
token=<your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "walletBalance": 0
  }
}
```

---

### Login User

Authenticate existing user.

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "walletBalance": 150.00
  }
}
```

---

### Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user",
    "walletBalance": 150.00,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Logout User

Logout current user.

**Endpoint:** `POST /auth/logout`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🚗 Parking Spot Endpoints

### Get All Parking Spots

Retrieve parking spots with optional filters.

**Endpoint:** `GET /parking`

**Access:** Public

**Query Parameters:**
- `city` (optional): Filter by city
- `state` (optional): Filter by state
- `minPrice` (optional): Minimum price per hour
- `maxPrice` (optional): Maximum price per hour
- `lat` (optional): Latitude for geo search
- `lng` (optional): Longitude for geo search
- `radius` (optional): Search radius in km (default: 5)

**Example Request:**
```
GET /parking?city=New York&minPrice=20&maxPrice=100
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Downtown Parking",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "location": {
        "type": "Point",
        "coordinates": [-73.9851, 40.7589]
      },
      "pricePerHour": 50,
      "totalSlots": 10,
      "availableSlots": 7,
      "images": [
        {
          "url": "https://res.cloudinary.com/...",
          "publicId": "spot-on/..."
        }
      ],
      "owner": {
        "_id": "...",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Get Single Parking Spot

Get details of a specific parking spot.

**Endpoint:** `GET /parking/:id`

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Downtown Parking",
    "description": "Secure parking with 24/7 access",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "location": {
      "type": "Point",
      "coordinates": [-73.9851, 40.7589]
    },
    "pricePerHour": 50,
    "totalSlots": 10,
    "availableSlots": 7,
    "images": [...],
    "amenities": ["CCTV", "24/7 Access"],
    "vehicleTypes": ["car", "bike"],
    "owner": {...},
    "rating": {
      "average": 4.5,
      "count": 23
    }
  }
}
```

---

### Create Parking Spot

Add a new parking spot.

**Endpoint:** `POST /parking`

**Access:** Protected

**Content-Type:** `multipart/form-data`

**Request Body:**
```
title: "Downtown Parking"
description: "Secure parking near metro"
address: "123 Main St"
city: "New York"
state: "NY"
zipCode: "10001"
location[coordinates][0]: -73.9851
location[coordinates][1]: 40.7589
pricePerHour: 50
totalSlots: 10
amenities: ["CCTV", "24/7 Access"]
vehicleTypes: ["car", "bike"]
images: [file1, file2, file3]
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Downtown Parking",
    ...
  }
}
```

---

### Get Available Cities

Get list of cities with parking spots.

**Endpoint:** `GET /parking/cities`

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    "Boston",
    "Chicago",
    "Los Angeles",
    "New York",
    "San Francisco"
  ]
}
```

---

## 🎫 Booking Endpoints

### Create Booking

Create a new parking booking and Razorpay order.

**Endpoint:** `POST /bookings`

**Access:** Protected

**Request Body:**
```json
{
  "parkingSpotId": "507f1f77bcf86cd799439011",
  "carId": "507f1f77bcf86cd799439022",
  "startTime": "2024-02-15T09:00:00.000Z",
  "endTime": "2024-02-15T17:00:00.000Z",
  "hours": 8,
  "specialRequests": "Need EV charging"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "507f1f77bcf86cd799439033",
      "bookingCode": "SPOT17051234567ABC",
      "totalAmount": 400,
      "status": "pending",
      "orderId": "order_123456789"
    },
    "order": {
      "id": "order_123456789",
      "amount": 40000,
      "currency": "INR",
      "key": "rzp_test_xxxxx"
    }
  }
}
```

---

### Verify Payment

Verify Razorpay payment and confirm booking.

**Endpoint:** `POST /bookings/verify-payment`

**Access:** Protected

**Request Body:**
```json
{
  "razorpay_payment_id": "pay_123456789",
  "razorpay_order_id": "order_123456789",
  "razorpay_signature": "abc123def456...",
  "bookingId": "507f1f77bcf86cd799439033"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment verified and booking confirmed",
  "data": {
    "_id": "507f1f77bcf86cd799439033",
    "status": "confirmed",
    "paymentStatus": "paid",
    "paymentId": "pay_123456789"
  }
}
```

---

### Get My Bookings

Get all bookings for authenticated user.

**Endpoint:** `GET /bookings/my`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439033",
      "bookingCode": "SPOT17051234567ABC",
      "parkingSpot": {...},
      "car": {...},
      "startTime": "2024-02-15T09:00:00.000Z",
      "endTime": "2024-02-15T17:00:00.000Z",
      "hours": 8,
      "totalAmount": 400,
      "status": "confirmed",
      "paymentStatus": "paid"
    }
  ]
}
```

---

### Cancel Booking

Cancel an existing booking.

**Endpoint:** `PUT /bookings/:id/cancel`

**Access:** Protected

**Request Body:**
```json
{
  "reason": "Plans changed"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439033",
    "status": "cancelled",
    "cancellationReason": "Plans changed",
    "cancelledAt": "2024-02-14T14:30:00.000Z"
  }
}
```

---

## 🚙 Car Endpoints

### Add Car

Add a new vehicle.

**Endpoint:** `POST /cars`

**Access:** Protected

**Request Body:**
```json
{
  "name": "Honda Civic",
  "numberPlate": "ABC1234",
  "type": "car",
  "color": "Blue",
  "isDefault": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439044",
    "name": "Honda Civic",
    "numberPlate": "ABC1234",
    "type": "car",
    "color": "Blue",
    "isDefault": true,
    "user": "507f1f77bcf86cd799439011"
  }
}
```

---

### Get My Cars

Get all vehicles for authenticated user.

**Endpoint:** `GET /cars`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439044",
      "name": "Honda Civic",
      "numberPlate": "ABC1234",
      "type": "car",
      "isDefault": true
    }
  ]
}
```

---

## 👑 Admin Endpoints

### Get Dashboard Stats

Get admin dashboard statistics.

**Endpoint:** `GET /admin/dashboard`

**Access:** Admin Only

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1250,
      "totalParkingSpots": 340,
      "totalBookings": 5680,
      "totalRevenue": 284000
    },
    "recentBookings": [...],
    "bookingsByStatus": [...],
    "revenueByMonth": [...],
    "topCities": [...]
  }
}
```

---

### Get All Users

Get list of all users.

**Endpoint:** `GET /admin/users`

**Access:** Admin Only

**Success Response (200):**
```json
{
  "success": true,
  "count": 1250,
  "data": [...]
}
```

---

### Get All Transactions

Get wallet transactions.

**Endpoint:** `GET /admin/transactions`

**Access:** Admin Only

**Success Response (200):**
```json
{
  "success": true,
  "count": 450,
  "data": [
    {
      "_id": "...",
      "user": {...},
      "booking": {...},
      "type": "earning",
      "amount": 400,
      "description": "Earnings from booking SPOT123",
      "balanceBefore": 1000,
      "balanceAfter": 1400,
      "createdAt": "..."
    }
  ]
}
```

---

## ⚡ Real-time Events (Socket.io)

### Connection

```javascript
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

### Slot Updated Event

Emitted when parking spot availability changes.

**Event:** `slotUpdated`

**Payload:**
```json
{
  "parkingId": "507f1f77bcf86cd799439011",
  "availableSlots": 6
}
```

**Client Listener:**
```javascript
socket.on('slotUpdated', (data) => {
  console.log(`Parking ${data.parkingId} now has ${data.availableSlots} slots`);
  // Update UI
});
```

---

## 🚨 Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## 🔄 Rate Limits

- **General API**: 100 requests per 15 minutes
- **Auth Routes**: 5 attempts per 15 minutes
- **Payment Routes**: 10 requests per hour
- **Upload Routes**: 20 uploads per hour

---

## 📝 Notes

1. All timestamps are in ISO 8601 format (UTC)
2. Prices are in Indian Rupees (INR)
3. Coordinates format: `[longitude, latitude]`
4. File uploads max size: 5MB per file
5. Max 5 images per parking spot

---

**API Version:** 1.0.0  
**Last Updated:** February 2024
