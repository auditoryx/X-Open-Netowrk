require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import rate limiting middleware
const { 
  authLimiter, 
  apiLimiter, 
  ddosProtection, 
  ipBlacklist 
} = require("./middleware/rateLimiting");

const app = express();

// Apply security middleware first
app.use(ipBlacklist);
app.use(ddosProtection);

app.use(express.json());
app.use(cors());

// Apply general API rate limiting
app.use('/api/', apiLimiter);

console.log("🔍 MONGO_URI:", process.env.MONGO_URI || "Not Found");

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Import & Use Routes
const serviceRoutes = require(__dirname + "/routes/services");
const authRoutes = require(__dirname + "/routes/auth");

// Apply stricter rate limiting to auth routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/services", serviceRoutes);

// Health check endpoint (no rate limiting)
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
