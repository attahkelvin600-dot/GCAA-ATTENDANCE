# GCAA Attendance System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except auth) require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### 1. Register New Personnel
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "employee_id": "NSS001",
  "email": "john@gcaa.gov.gh",
  "password": "SecurePassword123",
  "role": "personnel"
}
```

**Response (201):**
```json
{
  "message": "Personnel registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@gcaa.gov.gh",
    "role": "personnel"
  }
}
```

---

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@gcaa.gov.gh",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@gcaa.gov.gh",
    "role": "personnel"
  }
}
```

---

## Attendance Endpoints

### 3. Check-In
**POST** `/attendance/check-in`

**Required Auth:** Yes

**Request Body:**
```json
{
  "personnel_id": 1,
  "location": "Main Office, Accra",
  "location_name": "Airport Residential Area, Accra, Greater Accra",
  "latitude": 5.603717,
  "longitude": -0.186964,
  "notes": "Early arrival"
}
```

**Location Fields:**
- `location`: Display location text (manual or auto-detected)
- `location_name` (optional): Human-readable reverse-geocoded location
- `latitude` (optional): GPS latitude
- `longitude` (optional): GPS longitude

**Response (201):**
```json
{
  "message": "Check-in successful",
  "data": {
    "id": 1,
    "personnel_id": 1,
    "check_in_time": "2024-02-12T08:30:00Z",
    "location": "Main Office, Accra",
    "location_name": "Airport Residential Area, Accra, Greater Accra",
    "latitude": 5.603717,
    "longitude": -0.186964,
    "notes": "Early arrival",
    "created_at": "2024-02-12T08:30:00Z"
  }
}
```

---

### 4. Check-Out
**POST** `/attendance/check-out`

**Required Auth:** Yes

**Request Body:**
```json
{
  "personnel_id": 1,
  "notes": "Day completed"
}
```

**Response (200):**
```json
{
  "message": "Check-out successful",
  "data": {
    "id": 1,
    "personnel_id": 1,
    "check_in_time": "2024-02-12T08:30:00Z",
    "check_out_time": "2024-02-12T17:00:00Z",
    "checkout_notes": "Day completed"
  }
}
```

---

### 5. Get Attendance Records
**GET** `/attendance/records`

**Required Auth:** Yes

**Query Parameters:**
- `personnel_id` (optional): Filter by personnel
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Example Request:**
```
GET /attendance/records?personnel_id=1&start_date=2024-02-01&end_date=2024-02-12
```

**Response (200):**
```json
{
  "message": "Attendance records retrieved",
  "count": 10,
  "data": [
    {
      "id": 1,
      "personnel_id": 1,
      "name": "John Doe",
      "employee_id": "NSS001",
      "check_in_time": "2024-02-12T08:30:00Z",
      "check_out_time": "2024-02-12T17:00:00Z",
      "location": "Main Office",
      "location_name": "Airport Residential Area, Accra, Greater Accra",
      "latitude": 5.603717,
      "longitude": -0.186964,
      "notes": "Early arrival",
      "checkout_notes": "Day completed"
    }
  ]
}
```

---

### 6. Get Daily Report
**GET** `/attendance/daily-report`

**Required Auth:** Yes

**Query Parameters:**
- `date` (optional): Date for report (YYYY-MM-DD), defaults to today

**Example Request:**
```
GET /attendance/daily-report?date=2024-02-12
```

**Response (200):**
```json
{
  "message": "Daily report retrieved",
  "date": "2024-02-12",
  "count": 45,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "employee_id": "NSS001",
      "check_in": "2024-02-12T08:30:00Z",
      "check_out": "2024-02-12T17:00:00Z",
      "status": "Present"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "employee_id": "NSS002",
      "check_in": "Not checked in",
      "check_out": "Not checked out",
      "status": "Absent"
    }
  ]
}
```

---

## Personnel Endpoints (Admin Only)

### 7. Get All Personnel
**GET** `/personnel`

**Required Auth:** Yes (Admin role)

**Response (200):**
```json
{
  "message": "Personnel list retrieved",
  "count": 50,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "employee_id": "NSS001",
      "email": "john@gcaa.gov.gh",
      "role": "personnel",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### 8. Get Single Personnel
**GET** `/personnel/:id`

**Required Auth:** Yes

**Response (200):**
```json
{
  "message": "Personnel retrieved",
  "data": {
    "id": 1,
    "name": "John Doe",
    "employee_id": "NSS001",
    "email": "john@gcaa.gov.gh",
    "role": "personnel"
  }
}
```

---

### 9. Update Personnel
**PUT** `/personnel/:id`

**Required Auth:** Yes (Admin role)

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@gcaa.gov.gh",
  "role": "supervisor"
}
```

---

### 10. Delete Personnel
**DELETE** `/personnel/:id`

**Required Auth:** Yes (Admin role)

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "message": "Personnel not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## CORS Configuration
The API accepts requests from:
- `http://localhost:3000` (development)
- Configure additional origins in `.env` (CORS_ORIGIN)
