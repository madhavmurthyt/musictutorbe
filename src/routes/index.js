const express = require('express');
const authRoutes = require('./auth');
const tutorRoutes = require('./tutors');
const studentRoutes = require('./students');
const enquiryRoutes = require('./enquiries');

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
    },
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/tutors', tutorRoutes);
router.use('/students', studentRoutes);
router.use('/enquiries', enquiryRoutes);

module.exports = router;
