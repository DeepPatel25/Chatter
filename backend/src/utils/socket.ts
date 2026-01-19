import { Socket, Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "@clerk/express";
import User from "../models/User";
import Chat from "../models/Chat";
import Message from "../models/Message";

// Extend Socket interface to include userId
export interface SocketWithUserId extends Socket {
  userId?: string;
}

// store online users in memory : userId -> socketId
export const onlineUsers: Map<string, string> = new Map();

// Initialize and configure socket.io with the provided HTTP server
export async function initializeSocket(httpServer: HttpServer) {
  const allowedOrigins = [
    "http://localhost:8081", // Expo Mobile
    "http://localhost:5173", // Vite Web Dev
    process.env.FRONTEND_URL as string, // Production Frontend
  ];

  // Create Socket.io server
  const io = new SocketServer(httpServer, {
    cors: { origin: allowedOrigins },
  });

  // verify socket connection
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token; // this is what user will send from client side
    if (!token)
      return next(new Error("Authentication error: No token provided"));

    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY as string,
      });
      const clerkId = session.sub;
      const user = await User.findOne({ clerkId });

      if (!user) return next(new Error("User not found"));

      (socket as SocketWithUserId).userId = user.id.toString();

      next();
    } catch (error: any) {
      next(new Error(error?.message || "Authentication failed"));
    }
  });

  // Handle socket connection
  io.on("connection", (socket) => {
    const userId = (socket as SocketWithUserId).userId;

    // send list of currently online users
    socket.emit("online-users", { userIds: Array.from(onlineUsers.keys()) });

    // store user in the online users map
    onlineUsers.set(userId as string, socket.id);

    // notify other users that this user is online
    socket.broadcast.emit("user-online", { userId });

    // join a room specific to the user for direct messages
    socket.join(`user:${userId}`);

    // handle joining chat rooms
    socket.on("join-chat", (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    // handle leaving chat rooms
    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    // handle sending messages
    socket.on(
      "send-message",
      async (data: { chatId: string; text: string }) => {
        try {
          const { chatId, text } = data;

          const chat: any = await Chat.findOne({
            _id: chatId,
            participants: userId,
          });

          if (!chat) {
            socket.emit("socket-error", { message: "Chat not found" });
            return;
          }

          const message = await Message.create({
            chat: chatId,
            sender: userId,
            text,
          });

          chat.lastMessage = message.id;
          chat.lastMessageAt = new Date();
          await chat.save();

          await message.populate("sender", "name email avatar");

          // Emit the new message to all participants in the chat
          io.to(`chat:${chatId}`).emit("new-message", { message });

          // also emit to users individually to handle cases where they might not be in the chat room
          for (const participantsId of chat.participants) {
            io.to(`user:${participantsId}`).emit("new-message", message);
          }
        } catch (error) {}
      },
    );

    // TODO: later
    socket.on("typing", async (data) => {});

    // handle socket disconnection
    socket.on("disconnect", () => {
      // remove user from online users map
      onlineUsers.delete(userId as string);

      // notify other users that this user is offline
      socket.broadcast.emit("user-offline", { userId });
    });
  });

  return io;
}
