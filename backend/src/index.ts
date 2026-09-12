import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { connectDB } from "./config/database";
import { initCloudinary } from "./config/cloudinary";
import { initSocket } from "./config/socket";
import { errorHandler, asyncHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "https://price-seven-iota.vercel.app",
      "http://localhost:3000"
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize services
const startServer = async () => {
  console.log("📡 Initializing services...");
  await connectDB();
  console.log("✓ Database initialized");
  
  initCloudinary();
  const io = initSocket(httpServer);
  console.log("✓ Socket.IO initialized");

  // Health check route
  app.get("/health", (req, res) => {
    res.json({
      success: true,
      message: "Backend is running",
      timestamp: new Date(),
    });
  });

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      path: req.path,
    });
  });

  // Error handling middleware
  app.use(errorHandler);

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 Grocery Price Management Backend`);
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api`);
    console.log(`✓ Health check: http://localhost:${PORT}/health\n`);
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n\nShutting down gracefully...");
    httpServer.close();
    process.exit(0);
  });
};

// Call the startup function
startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
