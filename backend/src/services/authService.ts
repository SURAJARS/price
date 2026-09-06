import { User } from "../models/User";
import { hashPassword, comparePassword, generateToken } from "../utils/helpers";
import { AppError } from "../middleware/errorHandler";
import { UserRole, IUser } from "../types";

export class AuthService {
  // Register user
  static async register(
    email: string,
    password: string,
    name: string,
    role: UserRole = UserRole.STAFF
  ): Promise<any> {
    try {
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError(400, "User with this email already exists");
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        name,
        role,
      });

      await user.save();

      return {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<any> {
    try {
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        throw new AppError(401, "Invalid email or password");
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new AppError(401, "Invalid email or password");
      }

      if (!user.isActive) {
        throw new AppError(403, "User account is inactive");
      }

      const token = generateToken(user._id?.toString() || "");

      return {
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId).select("-password");

      if (!user) {
        throw new AppError(404, "User not found");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // List all staff members (owner only)
  static async listStaff(): Promise<any> {
    try {
      const staff = await User.find({ role: UserRole.STAFF })
        .select("-password")
        .sort({ createdAt: -1 });

      return staff;
    } catch (error) {
      throw error;
    }
  }

  // Edit staff member (owner only)
  static async editStaff(staffId: string, data: { name?: string; email?: string }): Promise<any> {
    try {
      const staff = await User.findById(staffId);
      if (!staff) {
        throw new AppError(404, "Staff member not found");
      }

      if (staff.role !== UserRole.STAFF) {
        throw new AppError(400, "Can only edit staff members");
      }

      // Check if email is being changed and if it already exists
      if (data.email && data.email !== staff.email) {
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
          throw new AppError(400, "Email already in use");
        }
        staff.email = data.email;
      }

      if (data.name) {
        staff.name = data.name;
      }

      await staff.save();

      return {
        _id: staff._id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        isActive: staff.isActive,
        createdAt: staff.createdAt,
      };
    } catch (error) {
      throw error;
    }
  }

  // Toggle staff active/inactive status (owner only)
  static async toggleStaffStatus(staffId: string): Promise<any> {
    try {
      const staff = await User.findById(staffId);
      if (!staff) {
        throw new AppError(404, "Staff member not found");
      }

      if (staff.role !== UserRole.STAFF) {
        throw new AppError(400, "Can only toggle staff members");
      }

      staff.isActive = !staff.isActive;
      await staff.save();

      return {
        _id: staff._id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        isActive: staff.isActive,
        createdAt: staff.createdAt,
      };
    } catch (error) {
      throw error;
    }
  }
}
