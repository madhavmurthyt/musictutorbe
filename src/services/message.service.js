const { Op } = require('sequelize');
const { User, Conversation, Message } = require('../models');
const ApiError = require('../utils/ApiError');
const pushService = require('./push.service');

const createConversationForEnquiry = async (enquiryId, studentId, tutorId) => {
  const existing = await Conversation.findOne({ where: { enquiryId } });
  if (existing) return existing;

  return Conversation.create({ enquiryId, studentId, tutorId });
};

const verifyParticipant = async (conversationId, userId) => {
  const conversation = await Conversation.findByPk(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found', 'CONVERSATION_NOT_FOUND');
  }
  if (conversation.studentId !== userId && conversation.tutorId !== userId) {
    throw new ApiError(403, 'Access denied', 'FORBIDDEN');
  }
  return conversation;
};

const listMessages = async (conversationId, userId, { before, limit = 30 }) => {
  const conversation = await verifyParticipant(conversationId, userId);

  const where = { conversationId };
  if (before) {
    const cursor = await Message.findByPk(before, { attributes: ['createdAt'] });
    if (cursor) {
      where.createdAt = { [Op.lt]: cursor.createdAt };
    }
  }

  const messages = await Message.findAll({
    where,
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'photoUrl'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: limit + 1,
  });

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();
  messages.reverse();

  // Mark as read
  await markMessagesAsRead(conversationId, userId);

  return {
    messages: messages.map(formatMessage),
    hasMore,
  };
};

const sendMessage = async (conversationId, senderId, content) => {
  const conversation = await verifyParticipant(conversationId, senderId);

  const message = await Message.create({
    conversationId,
    senderId,
    content,
  });

  await Conversation.update(
    { lastMessageAt: message.createdAt },
    { where: { id: conversationId } }
  );

  const sender = await User.findByPk(senderId, {
    attributes: ['id', 'name', 'photoUrl'],
  });

  const recipientId =
    conversation.studentId === senderId
      ? conversation.tutorId
      : conversation.studentId;

  pushService.sendPushNotification(recipientId, {
    title: sender.name,
    body: content.length > 100 ? content.substring(0, 100) + '...' : content,
    data: { type: 'new_message', conversationId },
  });

  return formatMessage({ ...message.toJSON(), sender });
};

const markMessagesAsRead = async (conversationId, userId) => {
  await Message.update(
    { readAt: new Date() },
    {
      where: {
        conversationId,
        senderId: { [Op.ne]: userId },
        readAt: null,
      },
    }
  );
};

const getUnreadCounts = async (userId) => {
  const conversations = await Conversation.findAll({
    where: {
      [Op.or]: [{ studentId: userId }, { tutorId: userId }],
    },
    attributes: ['id'],
  });

  if (conversations.length === 0) {
    return { unreadCounts: {}, totalUnread: 0 };
  }

  const conversationIds = conversations.map((c) => c.id);

  const results = await Message.findAll({
    where: {
      conversationId: { [Op.in]: conversationIds },
      senderId: { [Op.ne]: userId },
      readAt: null,
    },
    attributes: [
      'conversationId',
      [Message.sequelize.fn('COUNT', Message.sequelize.col('id')), 'count'],
    ],
    group: ['conversation_id'],
    raw: true,
  });

  const unreadCounts = {};
  let totalUnread = 0;
  for (const row of results) {
    const count = parseInt(row.count, 10);
    unreadCounts[row.conversationId] = count;
    totalUnread += count;
  }

  return { unreadCounts, totalUnread };
};

function formatMessage(msg) {
  const plain = msg.toJSON ? msg.toJSON() : msg;
  return {
    id: plain.id,
    conversationId: plain.conversationId,
    senderId: plain.senderId,
    senderName: plain.sender?.name || null,
    senderPhotoUrl: plain.sender?.photoUrl || null,
    content: plain.content,
    readAt: plain.readAt,
    createdAt: plain.createdAt,
  };
}

module.exports = {
  createConversationForEnquiry,
  listMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCounts,
};
