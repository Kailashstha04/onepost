import type { SocialPlatform } from "./types";

export type MessagingConversation = { externalId: string; participantName: string; participantUsername: string | null; participantAvatar: string | null; lastMessage: string; lastMessageAt: string; unreadCount: number };
export type MessagingMessage = { externalId: string; senderType: "incoming" | "outgoing"; senderName: string; messageText: string; mediaUrl: string | null; sentAt: string; readAt: string | null };
export type MessagingNotification = { externalId: string; type: "message" | "comment" | "mention" | "follower" | "connection"; title: string; message: string; createdAt: string };
export type MessagingCapabilities = { conversations: boolean; sendMessage: boolean; markAsRead: boolean; notifications: boolean };
export interface SocialMessagingProvider { platform: SocialPlatform; capabilities: MessagingCapabilities; getConversations(): Promise<MessagingConversation[]>; getMessages(conversationId: string): Promise<MessagingMessage[]>; sendMessage(conversationId: string, message: string): Promise<MessagingMessage>; markAsRead(conversationId: string): Promise<void>; getNotifications(): Promise<MessagingNotification[]>; }