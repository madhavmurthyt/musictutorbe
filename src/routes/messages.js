const express = require('express');
const messageService = require('../services/message.service');
const { auth } = require('../middleware/auth');
const { requireUser } = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { success, created } = require('../utils/response');
const {
  sendMessageSchema,
  listMessagesQuerySchema,
} = require('../validators/message.schema');

const router = express.Router();

/**
 * GET /api/messages/unread-counts
 * Get unread message counts for all conversations
 */
router.get('/unread-counts', auth, requireUser, async (req, res, next) => {
  try {
    const result = await messageService.getUnreadCounts(req.userId);
    return success(res, 200, result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/messages/conversations/:conversationId
 * List messages in a conversation (also marks as read)
 */
router.get(
  '/conversations/:conversationId',
  auth,
  requireUser,
  validate(listMessagesQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const result = await messageService.listMessages(
        req.params.conversationId,
        req.userId,
        req.validatedQuery
      );
      return success(res, 200, result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/messages/conversations/:conversationId
 * Send a message
 */
router.post(
  '/conversations/:conversationId',
  auth,
  requireUser,
  validate(sendMessageSchema),
  async (req, res, next) => {
    try {
      const message = await messageService.sendMessage(
        req.params.conversationId,
        req.userId,
        req.validatedBody.content
      );
      return created(res, { message }, 'Message sent');
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/messages/conversations/:conversationId/read
 * Mark all messages as read
 */
router.post(
  '/conversations/:conversationId/read',
  auth,
  requireUser,
  async (req, res, next) => {
    try {
      await messageService.markMessagesAsRead(
        req.params.conversationId,
        req.userId
      );
      return success(res, 200, null, 'Messages marked as read');
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
