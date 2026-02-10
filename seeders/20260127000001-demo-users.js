'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Generate password hash (password: "password123")
    const passwordHash = await bcrypt.hash('password123', 12);

    // Pre-generate UUIDs for referencing
    const adminId = uuidv4();
    const teacher1Id = uuidv4();
    const teacher2Id = uuidv4();
    const teacher3Id = uuidv4();
    const teacher4Id = uuidv4();
    const teacher5Id = uuidv4();
    const student1Id = uuidv4();
    const student2Id = uuidv4();
    const student3Id = uuidv4();

    // ========================================
    // INSERT USERS
    // ========================================
    await queryInterface.bulkInsert('users', [
      // Admin
      {
        id: adminId,
        email: 'admin@musictutor.com',
        password_hash: passwordHash,
        name: 'Admin User',
        photo_url: 'https://i.pravatar.cc/300?u=admin',
        role: 'admin',
        auth_provider: 'email',
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Teachers
      {
        id: teacher1Id,
        email: 'guru.raghunath@musictutor.com',
        password_hash: passwordHash,
        name: 'Guru Raghunath Sharma',
        photo_url: 'https://i.pravatar.cc/300?u=guru1',
        role: 'teacher',
        auth_provider: 'email',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: teacher2Id,
        email: 'priya.venkatesh@musictutor.com',
        password_hash: passwordHash,
        name: 'Priya Venkatesh',
        photo_url: 'https://i.pravatar.cc/300?u=priya2',
        role: 'teacher',
        auth_provider: 'email',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: teacher3Id,
        email: 'karthik.s@musictutor.com',
        password_hash: passwordHash,
        name: 'Karthik Subramanian',
        photo_url: 'https://i.pravatar.cc/300?u=karthik3',
        role: 'teacher',
        auth_provider: 'email',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: teacher4Id,
        email: 'lakshmi.n@musictutor.com',
        password_hash: passwordHash,
        name: 'Lakshmi Narayanan',
        photo_url: 'https://i.pravatar.cc/300?u=lakshmi4',
        role: 'teacher',
        auth_provider: 'email',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: teacher5Id,
        email: 'anand.k@musictutor.com',
        password_hash: passwordHash,
        name: 'Anand Krishnamurthy',
        photo_url: 'https://i.pravatar.cc/300?u=anand5',
        role: 'teacher',
        auth_provider: 'email',
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Students
      {
        id: student1Id,
        email: 'alex.johnson@gmail.com',
        password_hash: passwordHash,
        name: 'Alex Johnson',
        photo_url: 'https://i.pravatar.cc/300?u=student1',
        role: 'student',
        auth_provider: 'email',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: student2Id,
        email: 'maya.patel@gmail.com',
        password_hash: passwordHash,
        name: 'Maya Patel',
        photo_url: 'https://i.pravatar.cc/300?u=maya101',
        role: 'student',
        auth_provider: 'google',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: student3Id,
        email: 'raj.kumar@gmail.com',
        password_hash: passwordHash,
        name: 'Raj Kumar',
        photo_url: 'https://i.pravatar.cc/300?u=raj102',
        role: 'student',
        auth_provider: 'email',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ========================================
    // INSERT STUDENT PROFILES
    // ========================================
    await queryInterface.bulkInsert('student_profiles', [
      {
        id: uuidv4(),
        user_id: student1Id,
        level: 'beginner',
        preferred_instruments: ['Mridangam'],
        bio: 'Eager to learn traditional percussion!',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: student2Id,
        level: 'intermediate',
        preferred_instruments: ['Mridangam', 'Tabla'],
        bio: 'Two years of learning, looking to advance.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: student3Id,
        level: 'beginner',
        preferred_instruments: ['Mridangam'],
        bio: 'Complete beginner, very motivated!',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ========================================
    // INSERT TUTOR PROFILES
    // ========================================
    await queryInterface.bulkInsert('tutor_profiles', [
      {
        id: uuidv4(),
        user_id: teacher1Id,
        instrument: 'Mridangam',
        proficiency_level: 'expert',
        hourly_rate: 75.0,
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        bio: 'With over 25 years of experience in Carnatic percussion, I have trained under legendary masters and performed at prestigious venues worldwide. My teaching philosophy combines traditional guru-shishya parampara with modern pedagogical techniques.',
        availability: JSON.stringify([
          { day: 'mon', startTime: '09:00', endTime: '12:00' },
          { day: 'mon', startTime: '16:00', endTime: '19:00' },
          { day: 'wed', startTime: '09:00', endTime: '12:00' },
          { day: 'fri', startTime: '14:00', endTime: '18:00' },
          { day: 'sat', startTime: '10:00', endTime: '16:00' },
        ]),
        is_online: true,
        is_verified: true,
        years_of_experience: 25,
        rating: 0,
        review_count: 0,
        onboarding_complete: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: teacher2Id,
        instrument: 'Mridangam',
        proficiency_level: 'advanced',
        hourly_rate: 55.0,
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        bio: 'A passionate educator with 12 years of teaching experience. I specialize in making complex talas accessible to beginners while challenging advanced students with intricate compositions. Patient and encouraging teaching style.',
        availability: JSON.stringify([
          { day: 'tue', startTime: '10:00', endTime: '13:00' },
          { day: 'thu', startTime: '10:00', endTime: '13:00' },
          { day: 'sat', startTime: '09:00', endTime: '14:00' },
          { day: 'sun', startTime: '09:00', endTime: '12:00' },
        ]),
        is_online: true,
        is_verified: true,
        years_of_experience: 12,
        rating: 0,
        review_count: 0,
        onboarding_complete: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: teacher3Id,
        instrument: 'Mridangam',
        proficiency_level: 'expert',
        hourly_rate: 65.0,
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        bio: 'Award-winning percussionist and composer. I blend classical training with contemporary approaches, helping students develop their unique musical voice. Featured in international festivals across Asia and Europe.',
        availability: JSON.stringify([
          { day: 'mon', startTime: '17:00', endTime: '21:00' },
          { day: 'wed', startTime: '17:00', endTime: '21:00' },
          { day: 'fri', startTime: '17:00', endTime: '21:00' },
        ]),
        is_online: false,
        is_verified: true,
        years_of_experience: 18,
        rating: 0,
        review_count: 0,
        onboarding_complete: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: teacher4Id,
        instrument: 'Mridangam',
        proficiency_level: 'intermediate',
        hourly_rate: 40.0,
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        country: 'India',
        bio: 'Enthusiastic teacher focusing on foundational techniques. Perfect for beginners looking to start their Mridangam journey. I create a fun and supportive learning environment.',
        availability: JSON.stringify([
          { day: 'tue', startTime: '16:00', endTime: '20:00' },
          { day: 'thu', startTime: '16:00', endTime: '20:00' },
          { day: 'sat', startTime: '08:00', endTime: '12:00' },
        ]),
        is_online: true,
        is_verified: false,
        years_of_experience: 6,
        rating: 0,
        review_count: 0,
        onboarding_complete: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: teacher5Id,
        instrument: 'Mridangam',
        proficiency_level: 'advanced',
        hourly_rate: 60.0,
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        bio: 'Fusion artist bridging traditional Carnatic music with global rhythms. Ideal for students interested in both classical foundations and modern applications. Online and in-person sessions available.',
        availability: JSON.stringify([
          { day: 'mon', startTime: '11:00', endTime: '15:00' },
          { day: 'wed', startTime: '11:00', endTime: '15:00' },
          { day: 'fri', startTime: '11:00', endTime: '15:00' },
          { day: 'sun', startTime: '10:00', endTime: '16:00' },
        ]),
        is_online: true,
        is_verified: true,
        years_of_experience: 10,
        rating: 0,
        review_count: 0,
        onboarding_complete: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ========================================
    // INSERT ENQUIRIES
    // ========================================
    await queryInterface.bulkInsert('enquiries', [
      {
        id: uuidv4(),
        student_id: student1Id,
        tutor_id: teacher1Id,
        message:
          'I would love to learn the basics of Mridangam. I have no prior experience but am very eager to learn.',
        student_level: 'beginner',
        preferred_days: ['mon', 'wed', 'fri'],
        preferred_time: 'evening',
        status: 'pending',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        student_id: student1Id,
        tutor_id: teacher2Id,
        message: 'Interested in weekend classes if available.',
        student_level: 'beginner',
        preferred_days: ['sat', 'sun'],
        preferred_time: 'morning',
        status: 'accepted',
        responded_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        student_id: student2Id,
        tutor_id: teacher1Id,
        message:
          'I have been learning Mridangam for 2 years and looking for a new teacher to help me advance to the next level.',
        student_level: 'intermediate',
        preferred_days: ['tue', 'thu'],
        preferred_time: 'afternoon',
        status: 'pending',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        student_id: student3Id,
        tutor_id: teacher1Id,
        message: 'Complete beginner, very motivated to learn!',
        student_level: 'beginner',
        preferred_days: ['sat'],
        preferred_time: 'morning',
        status: 'pending',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        student_id: student2Id,
        tutor_id: teacher3Id,
        message:
          'Looking for an expert teacher to help me prepare for upcoming performances.',
        student_level: 'advanced',
        preferred_days: ['mon', 'wed', 'fri'],
        preferred_time: 'evening',
        status: 'accepted',
        responded_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updated_at: new Date(),
      },
    ]);

    console.log('✅ Seed data inserted successfully');
    console.log('📧 Test accounts (all passwords: password123):');
    console.log('   Admin: admin@musictutor.com');
    console.log('   Teacher: guru.raghunath@musictutor.com');
    console.log('   Student: alex.johnson@gmail.com');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('enquiries', null, {});
    await queryInterface.bulkDelete('tutor_profiles', null, {});
    await queryInterface.bulkDelete('student_profiles', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
