import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: SocketIOServer;

export const initSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`✓ Client connected: ${socket.id}`);

    // Handle user joining (staff or admin)
    socket.on("join-user", (userId: string, role: string) => {
      socket.join(`user:${userId}`);
      socket.join(`role:${role}`);
      console.log(`User ${userId} (${role}) joined socket rooms`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`✗ Client disconnected: ${socket.id}`);
    });
  });

  console.log("✓ Socket.IO configured");
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

// Emit price update to all connected staff
export const notifyPriceUpdate = (
  productVariantId: string,
  newPrices: {
    b2bPrice: number;
    b2cPrice: number;
    purchaseCost?: number;
  }
): void => {
  io.to("role:staff").emit("price-updated", {
    productVariantId,
    prices: newPrices,
    timestamp: new Date(),
  });
};

// Emit new product to all connected users
export const notifyNewProduct = (productData: any): void => {
  io.emit("product-added", productData);
};
