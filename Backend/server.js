import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import mlRoutes from "./routes/mlRoutes.js";
import contactRoute from "./routes/contact.js";
import ratingRoutes from "./routes/rating.js";

// Load environment variables
dotenv.config();

// Connect database
connectDB();

const app = express();

//
// ✅ GLOBAL MIDDLEWARE
//

// Security headers
app.use(helmet());

// Logging (optional but recommended)
app.use(morgan("dev"));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//
// ✅ CORS CONFIGURATION
//

const allowedOrigins = [
  "http://localhost:5173",
  "https://fitness-diet-recommendation-system-self.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked: ${origin}`);
        callback(null, false); // safer than throwing error
      }
    },
    credentials: true,
  })
);

//
// ✅ ROUTES
//

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.use("/api/contact", contactRoute);
app.use("/api/ratings", ratingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ml", mlRoutes);

//
// ✅ NOT FOUND HANDLER
//

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

//
// ✅ GLOBAL ERROR HANDLER
//

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

//
// ✅ SERVER START
//

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});