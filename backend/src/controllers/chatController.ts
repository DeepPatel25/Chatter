import type { AuthRequest } from "../middleware/auth";
import type { Response, NextFunction } from "express";
import Chat from "../models/Chat";

export async function getChats(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name avatar")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    const formattedChats = chats.map((chat: any) => {
      const otherParticipants = chat.participants.find(
        (p: any) => p._id.toString() !== userId,
      );
      return {
        _id: chat._id,
        participant: otherParticipants,
        lastMessage: chat.lastMessage,
        lestMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
      };
    });

    return res.json(formattedChats);
  } catch (error) {
    next(error);
  }
}

export async function getOrCreateChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    const { participantId } = req.params;

    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
    })
      .populate("participants", "name avatar")
      .populate("lastMessage");

    if (!chat) {
      const newChat = new Chat({
        participants: [userId, participantId],
      });

      await newChat.save();
      chat = await newChat.populate("participants", "name avatar");
    }

    const otherParticipant = (chat.participants as any).find(
      (p: any) => p._id.toString() !== userId,
    );

    return res.json({
      _id: chat._id,
      participant: otherParticipant ?? null,
      lastMessage: chat.lastMessage,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
    });
  } catch (error) {
    next(error);
  }
}
