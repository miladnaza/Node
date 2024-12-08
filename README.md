
# Book E-commerce Website - Backend

This repository contains the backend logic and API endpoints for the Book E-commerce Website, acting as the bridge between the frontend and the database. It manages user authentication, book data operations, and ad retrieval to deliver a seamless e-commerce experience.

## 📋 Features

- **Books API:**
  - Fetch all books or retrieve random samples.
  - Search and filter books by title, category, author, or rating.
  - Support flexible query options, including case-insensitive and partial matches.

- **Users API:**
  - Secure user registration with password hashing using bcrypt.js.
  - User login with authentication and session management.

- **Ads API:**
  - Retrieve and manage advertisements for displaying promotional content at the top of the website.

- **Secure Authentication:**
  - Implement token-based authentication using JSON Web Tokens (JWT).

- **Robust Input Validation:**
  - Ensure all API endpoints handle errors gracefully and securely.


## 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcrypt.js

## 📋 Prerequisites
- Node.js: Download and install Node.js.
- MongoDB: Ensure a MongoDB instance is running locally or use MongoDB Atlas.
- npm: Comes with Node.js installation.
  
## 🚀 Setup Instructions

1. **Clone the Repository**  
2. **Install Dependencies**  
     ```bash
     npm install
     ```

3. **Environment Configuration**  
   1. Create a `.env` file in the root directory.  
   2. Add the following configuration to the `.env` file:  
      ```env
      MONGO_URI=your_mongodb_connection_string
      ```  
      - Replace `your_mongodb_connection_string` with your actual MongoDB connection string.  

4. **Run the Application**  
     ```bash
     npm run dev
     ```
The application will be available at http://localhost:3000.

## 🎮 Usage Guide

### **Books API**
- `GET /api/books`  : Fetch all books.  
- `GET /api/books/search?title=<title>`  : Search books by title.  
- `GET /api/books/category/:category`  : Filter books by category.  
- `GET /api/books/author/:author`  : Filter books by author.  
- `GET /api/books/rating/:rating`  : Fetch books with a minimum rating.  
### **Users API**
- `POST /register`  : Register a new user.  
- `POST /login`  : Log in an existing user.  

### **Ads API**
- `GET /api/ads`  : Retrieve all ads.  


## 🤝Contributors
  - Niloofar Koochakian Jazi
  - Ansh Satish Acharya
  - Milad Nazari
  - Utsav Ketanbhai Mistry
  - Yeoul Kang

