const express = require('express');
const authRoutes = require('./auth');
const tutorRoutes = require('./tutors');
const studentRoutes = require('./students');
const enquiryRoutes = require('./enquiries');
const messageRoutes = require('./messages');
const lessonRoutes = require('./lessons');

// ============================================
// API ROUTES AGGREGATOR
// ============================================

const router = express.Router();

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Music Tutor API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tutors: '/api/tutors',
      students: '/api/students',
      enquiries: '/api/enquiries',
      messages: '/api/messages',
      lessons: '/api/lessons',
    },
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/tutors', tutorRoutes);
router.use('/students', studentRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/messages', messageRoutes);
router.use('/lessons', lessonRoutes);

module.exports = router;
