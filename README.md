# Hostel Management System

A comprehensive web-based Hostel Management System built with Node.js, Express.js, MongoDB, and vanilla JavaScript.

## Features

### Student Features
- User registration and login
- Apply for hostel accommodation
- View room allocation and roommate details
- Submit maintenance/complaint requests
- Track complaint status (Pending/Resolved)

### Admin Features
- Login to manage hostels and rooms
- Add and manage hostels
- Add and manage rooms
- Approve/reject room requests
- Allocate rooms to students
- View and manage maintenance complaints
- Dashboard with statistics (total hostels, rooms, pending requests, active complaints)

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd hackathon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory (or the file will be created automatically):
   ```
   MONGODB_URI=mongodb://localhost:27017/hostel-management
   JWT_SECRET=your-secret-key-change-in-production
   PORT=3000
   ```

   **Note:** If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

4. **Start MongoDB:**
   - If using local MongoDB, make sure MongoDB is running:
     ```bash
     # On Windows
     net start MongoDB
     
     # On macOS/Linux
     sudo systemctl start mongod
     ```

5. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Access the application:**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

### First Time Setup

1. **Register an Admin Account:**
   - Click "Register" on the login page
   - Fill in the registration form
   - Select "Admin" as the role
   - Complete registration

2. **Register Student Accounts:**
   - Students can register themselves
   - Select "Student" as the role
   - Fill in student ID, contact, and gender

3. **Admin Setup:**
   - Login as admin
   - Add hostels (Boys/Girls)
   - Add rooms to hostels (Single/Double/Triple)
   - Set room capacity

4. **Student Workflow:**
   - Login as student
   - Request a room from available hostels
   - Wait for admin approval
   - View allocated room details
   - Submit maintenance complaints

5. **Admin Workflow:**
   - View pending room requests
   - Approve/reject requests
   - Rooms are automatically allocated
   - View and resolve complaints
   - Monitor dashboard statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Hostels
- `POST /api/hostels` - Add hostel (Admin only)
- `GET /api/hostels` - Get all hostels
- `GET /api/hostels/:id` - Get hostel by ID

### Rooms
- `POST /api/rooms` - Add room (Admin only)
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/available` - Get available rooms
- `GET /api/rooms/:id` - Get room by ID

### Requests
- `POST /api/requests` - Request room (Student)
- `GET /api/requests` - Get requests (Admin: all, Student: own)
- `PUT /api/requests/:id/approve` - Approve request (Admin)
- `PUT /api/requests/:id/reject` - Reject request (Admin)

### Complaints
- `POST /api/complaints` - Submit complaint (Student)
- `GET /api/complaints` - Get complaints (Admin: all, Student: own)
- `PUT /api/complaints/:id` - Update complaint status (Admin)

### Reports
- `GET /api/reports` - Get dashboard statistics (Admin)

## Database Schema

### Users
- userId, name, role, email, password, studentId, contact, gender

### Hostels
- hostelId, name, type (Boys/Girls), totalRooms, address

### Rooms
- roomId, hostelId, roomNumber, type (Single/Double/Triple), capacity, occupiedCount, status (Available/Full)

### Requests
- requestId, studentId, hostelId, roomId, status (Pending/Approved/Rejected), requestDate

### Complaints
- complaintId, studentId, roomId, category, description, status (Pending/Resolved), createdAt

## Project Structure

```
hackathon/
├── models/          # MongoDB models
│   ├── User.js
│   ├── Hostel.js
│   ├── Room.js
│   ├── Request.js
│   └── Complaint.js
├── routes/          # API routes
│   ├── auth.js
│   ├── hostels.js
│   ├── rooms.js
│   ├── requests.js
│   ├── complaints.js
│   └── reports.js
├── middleware/      # Middleware functions
│   └── auth.js
├── public/          # Frontend files
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## Color Codes

- **Green:** Available rooms, Approved requests, Resolved complaints
- **Red:** Full rooms, Rejected requests
- **Yellow:** Pending requests, Pending complaints

## Troubleshooting

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify MongoDB port (default: 27017)

2. **Port Already in Use:**
   - Change PORT in .env file
   - Or stop the process using port 3000

3. **JWT Token Issues:**
   - Clear browser localStorage
   - Logout and login again

## Development

To run in development mode with auto-reload:
```bash
npm run dev
```

## License

ISC

## Author

Created for Hackathon - Problem Statement 26

