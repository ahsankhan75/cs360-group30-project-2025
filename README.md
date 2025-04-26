# EMCON - Emergency Medical Connections

EMCON is a healthcare navigation platform that helps users find hospitals, track blood donation requests, create digital medical cards, and leave hospital reviews.

## Project Structure
- `frontend/` - React application
- `backend/` - Express API server

## Deployment Structure
- 'Frontend' - Deployed on Vercel
- 'Backend' - Deployed on Render
- 'Python Script for AI Wait Time Predictions' - Deployed on Railway

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/emcon-db
   SECRET=your_jwt_secret_here
   ```
   
   You can copy the example file:
   ```
   cp .env.example .env
   ```

4. Start the server:
   ```
   npm run dev
   # or for production
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Common Issues

### ECONNREFUSED Error
If you see this error in your frontend:
```
Proxy error: Could not proxy request /api/hospitals/names from localhost:3000 to http://localhost:4000/.
See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (ECONNREFUSED).
```

This typically means your backend server is not running. Make sure to:

1. Check that your backend server is running on port 4000
2. Verify that your `.env` file exists with correct values
3. Look for any error messages in your backend terminal
4. Try restarting both servers

### MongoDB Connection Issues
If your backend can't connect to MongoDB:

1. Make sure MongoDB is running locally (or update your connection string if using Atlas)
2. Check the MONGO_URI in your .env file
3. Ensure your IP address is whitelisted if using MongoDB Atlas

## API Endpoints

### Hospitals
- `GET /api/hospitals/filter` - Get hospitals with filters
- `GET /api/hospitals/names` - Get list of hospital names and IDs
- `GET /api/hospitals/:id` - Get details of specific hospital

### Blood Requests
- `GET /api/blood-requests` - Get all blood requests
- `GET /api/blood-requests/mine` - Get current user's requests (requires auth)
- `GET /api/blood-requests/:requestId` - Get specific blood request
- `POST /api/blood-requests` - Create new request
- `POST /api/blood-requests/multiple` - Create multiple requests (requires auth)
- `DELETE /api/blood-requests/:requestId` - Delete a request
- `PATCH /api/blood-requests/:requestId/accept` - Mark request as accepted

### Reviews
- `GET /api/reviews/hospital/:hospitalId` - Get reviews for a hospital
- `POST /api/reviews` - Create a new review (requires auth)

### Medical Cards
- `GET /api/medical-card` - Get user's medical card (requires auth)
- `POST /api/medical-card` - Create a medical card (requires auth)
