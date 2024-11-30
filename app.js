const express = require("express");
const cors = require("cors"); // Import cors
const mongoose = require("mongoose");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

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

  


// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});