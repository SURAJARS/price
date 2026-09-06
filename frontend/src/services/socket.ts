import { io, Socket } from "socket.io-client";
import { PriceUpdate } from "@/types";

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000", {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("✓ Connected to server via Socket.IO");
  });

  socket.on("disconnect", () => {
    console.log("✗ Disconnected from server");
  });

  socket.on("error", (error) => {
    console.error("Socket.IO error:", error);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const emitEvent = (eventName: string, data?: any): void => {
  if (socket) {
    socket.emit(eventName, data);
  }
};

export const onPriceUpdate = (callback: (data: PriceUpdate) => void): void => {
  if (socket) {
    socket.on("price-updated", callback);
  }
};

export const joinUserRoom = (userId: string, role: string): void => {
  if (socket) {
    socket.emit("join-user", userId, role);
  }
};

export const offPriceUpdate = (): void => {
  if (socket) {
    socket.off("price-updated");
  }
};

export const closeSocket = (): void => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
