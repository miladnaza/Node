const express = require("express");
const cors = require("cors"); // Import cors
const mongoose = require("mongoose");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const bcrypt = require('bcryptjs'); // Use bcryptjs for password hashing

// Use CORS middleware
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection (use your connection string here)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("Error connecting to MongoDB:", err.message));

// Define Book schema and model
const bookSchema = new mongoose.Schema({
    shortTitle: { type: String, required: true },
    fullTitle: { type: String },
    author: { type: String },
    ratings: { type: Number },
    price: { type: Number },
    category: { type: String },
    stock: { type: Number },
    image: { type: String },
    isbn: { type: String },
    description: { type: String },
});

const Book = mongoose.model("Book", bookSchema);

// Test route
app.get("/", (req, res) => {
    res.send("Welcome to the Bookstore API!");
});

app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.aggregate([{ $sample: { size: 1000 } }]); // Fetch 1000 random books (adjust size if needed)
    res.json(books); // Send all books to the frontend
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

app.get('/api/Books', async (req, res) => {
    try {
      const books = await Book.find(); // Use 'Book' model to query 'Books' collection
      console.log("Fetched Books:", books);
      res.json(books);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  });


app.get("/api/books/search", async (req, res) => {
    try {
        const { title } = req.query;

        if (!title) {
            return res.status(400).json({ error: "Title query parameter is required" });
        }

        // Perform a case-insensitive search with a flexible partial match
        const books = await Book.find({
            $or: [
                { title: { $regex: title, $options: "i" } },
                { shortTitle: { $regex: title, $options: "i" } }
            ]
        });

        if (books.length === 0) {
            return res.status(404).json({ message: "No books found matching the title." });
        }

        res.json(books);
    } catch (error) {
        console.error("Error searching books:", error.message);
        res.status(500).json({ error: "An error occurred while searching for books." });
    }
});
// Define Ad schema and model
const addSchema = new mongoose.Schema({
    text: { type: String, required: true },
});

// Explicitly specify the collection name as 'adds'
const Add = mongoose.model("Add", addSchema, "adds");

// API route to fetch all ads
app.get("/api/ads", async (req, res) => {
    try {
        const ads = await Add.find(); // Fetch all ads from the 'adds' collection
        res.json(ads); // Send the ads as a JSON response
    } catch (error) {
        console.error("Error fetching ads:", error.message);
        res.status(500).json({ error: "Failed to fetch ads" });
    }
});

app.get("/api/books/shortTitle/:shortTitle", async (req, res) => {
  const shortTitle = decodeURIComponent(req.params.shortTitle).trim(); // Decode and clean input
  console.log("Processed shortTitle:", shortTitle); // Debugging log

  try {
    // Perform case-insensitive and flexible matching
    const books = await Book.find({
      shortTitle: { $regex: `^${shortTitle}$`, $options: "i" }, // Exact match
    });

    if (!books.length) {
      return res.status(404).json({ message: "No books found with this shortTitle." });
    }

    res.json(books);
  } catch (error) {
    console.error("Error fetching books by shortTitle:", error.message);
    res.status(500).json({ error: "Failed to fetch books by shortTitle" });
  }
});

// API route to fetch books filtered by category
app.get("/api/books/category/:category", async (req, res) => {
    const { category } = req.params;

    try {
        if (category === "All") {
            // If "All" category is selected, return all books
            const books = await Book.find();  // Return all books
            return res.json(books);
        } else {
            // Otherwise, filter by the specific category
            const books = await Book.find({ category: category });
            return res.json(books);
        }
    } catch (error) {
        console.error("Error fetching books by category:", error.message);
        res.status(500).json({ error: "Failed to fetch books by category" });
    }
});

// API route to fetch books filtered by author
app.get("/api/books/author/:author", async (req, res) => {
    const { author } = req.params;

    if (author === "All") {
        // If "All" authors is selected, return all books
        try {
            const books = await Book.find();  // Return all books
            res.json(books);
        } catch (error) {
            console.error("Error fetching books by author:", error.message);
            res.status(500).json({ error: "Failed to fetch books by author" });
        }
    } else {
        try {
            // Filter books by author name
            const books = await Book.find({ author: { $regex: author, $options: "i" } }); // Case-insensitive search
            res.json(books);
        } catch (error) {
            console.error("Error fetching books by author:", error.message);
            res.status(500).json({ error: "Failed to fetch books by author" });
        }
    }
});

// API route to fetch books filtered by rating
app.get("/api/books/rating/:rating", async (req, res) => {
    const { rating } = req.params;

    try {
        let books;
        // If the rating is 1, 2, or 3 stars, get books with that exact rating
        if (rating === "1" || rating === "2" || rating === "3") {
            books = await Book.find({ ratings: parseFloat(rating) });
        } else {
            // For ratings like 4, 4.5, 5, we fetch books with ratings >= the selected rating
            books = await Book.find({ ratings: { $gte: parseFloat(rating) } });
        }
        res.json(books);
    } catch (error) {
        console.error("Error fetching books by rating:", error.message);
        res.status(500).json({ error: "Failed to fetch books by rating" });
    }
});

app.get("/api/books/rate/below-5", async (req, res) => {
    try {
        // Use the correct field 'ratings' (plural) instead of 'rate' (singular)
        const books = await Book.find({ ratings: { $lt: 4.5 } }); // Filter books with rating less than 5
        res.json(books); // Send the books as a JSON response
    } catch (error) {
        console.error("Error fetching books:", error.message);
        res.status(500).json({ error: "Failed to fetch books with ratings below 5" });
    }
});

// User Schema & Model
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true }, 
    lastName: { type: String, required: true }, 
    phoneNumber: { type: String, required: true }, 
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
});

const User = mongoose.model("User", userSchema);

// Register Endpoint
app.post('/register', async (req, res) => {
    const { firstName, lastName, phoneNumber, email, password } = req.body;


    if (!firstName || !lastName || !phoneNumber || !email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

  
        const hashedPassword = await bcrypt.hash(password, 10).catch((error) => {
            console.error('Password hashing error:', error);
            throw error;
        });

        const newUser = new User({
            firstName,
            lastName,
            phoneNumber,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'Signup successful!' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter your email and password.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("Password valid:", isPasswordValid);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'The password does not match.' });
        }

        res.status(200).json({
            message: 'Login successful!',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});
  

// API route to submit a new review and update book ratings
app.post("/api/reviews", async (req, res) => {
  const { bookId, rating, review, reviewTitle, nickname, email, location, incentive } = req.body;

  // Input validation
  if (!bookId || !rating || !review || !reviewTitle || !nickname || !email || !location) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  try {
    // Save the new review
    const newReview = new Review({
      bookId,
      rating,
      review,
      reviewTitle,
      nickname,
      email,
      location,
      incentive: incentive || "No",
    });
    await newReview.save();

    // Fetch the book to update its rating
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Update the book's average rating
    const reviews = await Review.find({ bookId });
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;

    book.ratings = parseFloat(averageRating.toFixed(1)); // Round to 1 decimal place
    await book.save();

    res.status(201).json({ message: "Review submitted successfully!", review: newReview, updatedBook: book });
  } catch (error) {
    console.error("Error submitting review:", error.message);
    res.status(500).json({ error: "Failed to submit review" });
  }
});
const reviewSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    reviewTitle: { type: String, required: true },
    nickname: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true },
    incentive: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", reviewSchema);

// POST API for Submitting Reviews
app.post("/api/reviews", async (req, res) => {
    try {
        const newReview = new Review(req.body); // Create a new review from request body
        await newReview.save(); // Save the review to the database

        // After saving the review, update the book's average rating
        const reviews = await Review.find({ bookId: newReview.bookId }); // Get all reviews for this book
        const totalReviews = reviews.length;
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

        // Update the book's rating in the Book collection
        await Book.findByIdAndUpdate(
            newReview.bookId, // Book ID
            { ratings: averageRating.toFixed(2) }, // Update with new average rating
            { new: true } // Return the updated document
        );

        res.status(201).json({ message: "Review submitted successfully and book rating updated!" });
    } catch (error) {
        console.error("Error submitting review:", error.message);
        res.status(500).json({ error: "Failed to submit review and update book rating" });
    }
});

  
// API route to fetch reviews for a specific book by bookId
app.get("/api/reviews/book/:bookId", async (req, res) => {
    const { bookId } = req.params;

    try {
        // Fetch reviews with the matching bookId
        const reviews = await Review.find({ bookId });

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this book." });
        }

        // Calculate rating snapshot
        const ratingSnapshot = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((review) => {
            if (review.rating >= 1 && review.rating <= 5) {
                ratingSnapshot[review.rating]++;
            }
        });

        const totalReviews = reviews.length;
        const averageRating = totalReviews
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
            : 0;

        res.json({
            reviews,
            ratingSnapshot,
            totalReviews,
            averageRating,
        });
    } catch (error) {
        console.error("Error fetching reviews:", error.message);
        res.status(500).json({ error: "Failed to fetch reviews." });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
