const { z } = require('zod');

const sendMessageSchema = z.object({
  content: z
    .string({ required_error: 'Message content is required' })
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be less than 2000 characters')
    .trim(),
});

const listMessagesQuerySchema = z.object({
  before: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(50).default(30),
});

const conversationIdParamSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
});

module.exports = {
  sendMessageSchema,
  listMessagesQuerySchema,
  conversationIdParamSchema,
};
