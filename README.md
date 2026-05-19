Realtime Collaborative Notes App

A full-stack realtime collaborative notes platform built using React.js, Node.js, MongoDB, Express.js, and Socket.IO.
The application allows multiple users to edit notes simultaneously with realtime synchronization, typing indicators, auto-save, version tracking, conflict detection, and audit history management.

Features
Authentication System
User Registration
User Login
JWT Authentication
Protected Routes
Notes Management
Create Notes
Edit Notes
Delete Notes
Search Notes
Pagination Support
Realtime Collaboration Features
Live Realtime Editing
Multiple users can edit the same note simultaneously
Updates sync instantly across all connected users
Room-Based Collaboration
Each note has its own collaboration room
Only users inside the same note receive updates
Active Collaborators System
Displays currently active users
Live join/leave updates
Typing Indicator System
Shows who is currently typing
Debounced typing event optimization
Auto-Save System
Automatic note saving
Prevents data loss
Optimized delayed save mechanism
Conflict Detection & Prevention
Version-based conflict validation
Prevents stale data overwriting latest updates
HTTP 409 conflict handling
Automatic state synchronization recovery
Version Tracking System
Every update increments note version
Helps maintain synchronization consistency
Change History System
Tracks:
editor name
edit version
timestamp
Provides audit trail functionality
Synchronization Metadata

Displays:

Connection status
Save status
Current version
Last updated time
Advanced Concepts Implemented
WebSocket Architecture
Event-Driven Systems
Realtime Synchronization
Stateful Communication
Race Condition Handling
Conflict Detection
Optimistic Concurrency Control
Connection Lifecycle Management
Room-Based Collaboration
Distributed State Synchronization
Tech Stack
Frontend
React.js
Tailwind CSS
React Router DOM
Axios
Socket.IO Client
Lucide React Icons
Backend
Node.js
Express.js
MongoDB
Mongoose
Socket.IO
JWT Authentication
bcrypt.js
Project Architecture
Frontend Responsibilities
UI Rendering
Realtime Socket Communication
Auto-Save Handling
Synchronization Metadata
Conflict Recovery
Presence Management
Backend Responsibilities
REST API Handling
WebSocket Communication
Authentication & Authorization
Version Validation
Conflict Detection
Realtime Broadcasting
Database Responsibilities

MongoDB stores:

Users
Notes
Collaborators
Versions
Edit History
Synchronization Metadata
How Realtime Collaboration Works
User opens a live note
Socket connection is established
User joins note-specific room
Changes are broadcast in realtime
Version validation checks stale updates
Conflict detection prevents overwriting
Auto-save persists latest synchronized state
History system tracks modifications
Installation
Clone Repository
git clone https://github.com/your-username/realtime-notes-app.git
Install Frontend Dependencies
cd frontend
npm install
Install Backend Dependencies
cd backend
npm install
Environment Variables

Create .env file inside backend:

PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_jwt_secret
Run Backend
npm run dev
Run Frontend
npm run dev
Folder Structure
frontend/
 ├── pages/
 ├── services/
 ├── socket/
 ├── components/

backend/
 ├── controllers/
 ├── routes/
 ├── models/
 ├── middleware/
 ├── socket/
Key Technical Implementations
Optimistic Concurrency Control

Implemented using:

version tracking
backend validation
conflict rejection

Prevents:

race conditions
stale state overwrites
out-of-order updates
WebSocket Realtime Communication

Implemented using:

Socket.IO

Provides:

bidirectional realtime communication
live synchronization
presence tracking
Connection Lifecycle Management

Handled:

connect
reconnect
disconnect
cleanup
stale session recovery
Future Improvements
Rich Text Editor
Cursor Sharing
Realtime Comments
Notifications System
CRDT-Based Collaboration
File Attachments
Screenshots

Add project screenshots here.

Example:

Dashboard UI
Live Collaboration Page
Change History Sidebar
Author

Ashish Kumar Raushan

License

This project is for educational and learning purposes.
