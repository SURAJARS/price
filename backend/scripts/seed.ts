import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Import User model and types
import { User } from "../src/models/User";
import { UserRole } from "../src/types";

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("✓ Connected to MongoDB");

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});
    // console.log("✓ Cleared existing users");

    // Hash passwords
    const staffPasswordHash = await bcryptjs.hash("password123", 10);
    const adminPasswordHash = await bcryptjs.hash("admin123", 10);

    // Create demo users
    const demoUsers = [
      {
        email: "staff@example.com",
        password: staffPasswordHash,
        name: "Staff User",
        role: UserRole.STAFF,
        isActive: true,
      },
      {
        email: "admin@example.com",
        password: adminPasswordHash,
        name: "Admin User",
        role: UserRole.OWNER,
        isActive: true,
      },
    ];

    // Insert users
    const result = await User.insertMany(demoUsers, { ordered: false }).catch(
      (error) => {
        // If users already exist, just log it
        if (error.code === 11000) {
          console.log("⚠ Some users already exist, skipping duplicates");
          return [];
        }
        throw error;
      }
    );

    if (result && result.length > 0) {
      console.log(`✓ Created ${result.length} users`);
    }
    console.log("\nDemo credentials created:");
    console.log("  Staff User: staff@example.com / password123");
    console.log("  Admin User: admin@example.com / admin123");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");

    process.exit(0);
  } catch (error) {
    console.error("✗ Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();
