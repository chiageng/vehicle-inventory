import type { Conversation, ConversationMessage, User } from "../types";
import {
  generateId,
  readConversations,
  readMarketplace,
  readUsers,
  writeConversations,
} from "./db";

export function getConversationsForSeller(sellerId: string): Conversation[] {
  return readConversations()
    .filter((c) => c.sellerId === sellerId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getConversationsForBuyer(user: User): Conversation[] {
  const email = user.email.toLowerCase();
  return readConversations()
    .filter(
      (c) => c.buyerId === user.id || c.buyerEmail.toLowerCase() === email
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function ownsConversationAsBuyer(conversation: Conversation, user: User): boolean {
  return (
    conversation.buyerId === user.id ||
    conversation.buyerEmail.toLowerCase() === user.email.toLowerCase()
  );
}

export function createConversation(
  listingId: string,
  contactName: string,
  contactEmail: string,
  message: string,
  session: User | null
): Conversation | null {
  const marketplace = readMarketplace();
  const users = readUsers();
  const listing = marketplace.listings.find((l) => l.id === listingId);
  if (!listing || listing.status !== "active") return null;

  const seller = users.find((u) => u.id === listing.sellerId);
  const now = new Date().toISOString();
  const trimmed = message.trim();
  if (!contactName.trim() || !contactEmail.trim() || !trimmed) return null;

  const conversation: Conversation = {
    id: generateId("conv"),
    listingId,
    sellerId: listing.sellerId,
    buyerId: session?.id ?? null,
    buyerName: contactName.trim(),
    buyerEmail: contactEmail.trim(),
    status: "new",
    emailNotified: Boolean(seller?.email),
    smsNotified: Boolean(seller?.phone),
    messages: [
      {
        id: generateId("msg"),
        from: "buyer",
        senderId: session?.id ?? null,
        senderName: contactName.trim(),
        text: trimmed,
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const conversations = readConversations();
  conversations.push(conversation);
  writeConversations(conversations);
  return conversation;
}

export function addSellerReply(
  conversationId: string,
  replyMessage: string,
  session: User
): Conversation | null {
  if (session.role !== "seller" && session.role !== "reseller") return null;

  const trimmed = replyMessage.trim();
  if (!trimmed) return null;

  const conversations = readConversations();
  const idx = conversations.findIndex((c) => c.id === conversationId);
  if (idx < 0) return null;

  const conversation = conversations[idx];
  if (conversation.sellerId !== session.id) return null;

  const now = new Date().toISOString();
  const message: ConversationMessage = {
    id: generateId("msg"),
    from: "seller",
    senderId: session.id,
    senderName: session.name,
    text: trimmed,
    createdAt: now,
  };

  const updated: Conversation = {
    ...conversation,
    messages: [...conversation.messages, message],
    status: "replied",
    updatedAt: now,
  };

  conversations[idx] = updated;
  writeConversations(conversations);
  return updated;
}

export function addBuyerMessage(
  conversationId: string,
  message: string,
  session: User
): Conversation | null {
  const trimmed = message.trim();
  if (!trimmed) return null;

  const conversations = readConversations();
  const idx = conversations.findIndex((c) => c.id === conversationId);
  if (idx < 0) return null;

  const conversation = conversations[idx];
  if (!ownsConversationAsBuyer(conversation, session)) return null;

  const now = new Date().toISOString();
  const newMessage: ConversationMessage = {
    id: generateId("msg"),
    from: "buyer",
    senderId: session.id,
    senderName: session.name,
    text: trimmed,
    createdAt: now,
  };

  const updated: Conversation = {
    ...conversation,
    buyerId: conversation.buyerId ?? session.id,
    messages: [...conversation.messages, newMessage],
    status: "new",
    updatedAt: now,
  };

  conversations[idx] = updated;
  writeConversations(conversations);
  return updated;
}
