const { Op } = require('sequelize');
const { Lesson, LessonSchedule } = require('../models');
const pushService = require('../services/push.service');
const lessonService = require('../services/lesson.service');

function getLessonDateTime(scheduledDate, startTime) {
  return new Date(`${scheduledDate}T${startTime}:00`);
}

function getLessonEndTime(scheduledDate, startTime, durationMinutes) {
  const start = getLessonDateTime(scheduledDate, startTime);
  return new Date(start.getTime() + durationMinutes * 60 * 1000);
}

async function sendReminders() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in15m = new Date(now.getTime() + 15 * 60 * 1000);

  try {
    const lessons24h = await Lesson.findAll({
      where: {
        status: 'upcoming',
        reminder24hSent: false,
        scheduledDate: {
          [Op.between]: [
            now.toISOString().split('T')[0],
            in24h.toISOString().split('T')[0],
          ],
        },
      },
      include: [
        { model: LessonSchedule, as: 'schedule', attributes: ['dayOfWeek'] },
      ],
    });

    for (const lesson of lessons24h) {
      const lessonTime = getLessonDateTime(lesson.scheduledDate, lesson.startTime);
      const diff = lessonTime.getTime() - now.getTime();
      if (diff > 0 && diff <= 24 * 60 * 60 * 1000) {
        const dateStr = new Date(lesson.scheduledDate).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

        await Promise.all([
          pushService.sendPushNotification(lesson.studentId, {
            title: 'Lesson Tomorrow',
            body: `Your lesson is tomorrow at ${lesson.startTime} (${dateStr})`,
            data: { type: 'lesson_reminder_24h', lessonId: lesson.id },
          }),
          pushService.sendPushNotification(lesson.tutorId, {
            title: 'Lesson Tomorrow',
            body: `You have a lesson tomorrow at ${lesson.startTime} (${dateStr})`,
            data: { type: 'lesson_reminder_24h', lessonId: lesson.id },
          }),
        ]);
        await lesson.update({ reminder24hSent: true });
      }
    }

    const lessons15m = await Lesson.findAll({
      where: {
        status: 'upcoming',
        reminder15mSent: false,
        scheduledDate: now.toISOString().split('T')[0],
      },
    });

    for (const lesson of lessons15m) {
      const lessonTime = getLessonDateTime(lesson.scheduledDate, lesson.startTime);
      const diff = lessonTime.getTime() - now.getTime();
      if (diff > 0 && diff <= 15 * 60 * 1000) {
        await Promise.all([
          pushService.sendPushNotification(lesson.studentId, {
            title: 'Lesson Starting Soon',
            body: `Your lesson starts in 15 minutes`,
            data: { type: 'lesson_reminder_15m', lessonId: lesson.id },
          }),
          pushService.sendPushNotification(lesson.tutorId, {
            title: 'Lesson Starting Soon',
            body: `Your lesson starts in 15 minutes`,
            data: { type: 'lesson_reminder_15m', lessonId: lesson.id },
          }),
        ]);
        await lesson.update({ reminder15mSent: true });
      }
    }

    const completedLessons = await Lesson.findAll({
      where: {
        status: 'completed',
        postLessonSent: false,
      },
    });

    for (const lesson of completedLessons) {
      const endTime = getLessonEndTime(lesson.scheduledDate, lesson.startTime, lesson.durationMinutes);
      const diff = now.getTime() - endTime.getTime();
      if (diff >= 30 * 60 * 1000 && diff < 24 * 60 * 60 * 1000) {
        await Promise.all([
          pushService.sendPushNotification(lesson.studentId, {
            title: 'How Was Your Lesson?',
            body: 'Add notes about what you practiced today',
            data: { type: 'lesson_post', lessonId: lesson.id },
          }),
          pushService.sendPushNotification(lesson.tutorId, {
            title: 'Add Lesson Notes',
            body: 'Record what was covered in today\'s lesson',
            data: { type: 'lesson_post', lessonId: lesson.id },
          }),
        ]);
        await lesson.update({ postLessonSent: true });
      }
    }
  } catch (error) {
    console.error('[Cron] Error sending lesson reminders:', error.message);
  }
}

async function autoCompleteLessons() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const lessons = await Lesson.findAll({
      where: {
        status: 'upcoming',
        scheduledDate: { [Op.lte]: today },
      },
    });

    for (const lesson of lessons) {
      const endTime = getLessonEndTime(lesson.scheduledDate, lesson.startTime, lesson.durationMinutes);
      if (now >= endTime) {
        await lesson.update({ status: 'completed' });
      }
    }
  } catch (error) {
    console.error('[Cron] Error auto-completing lessons:', error.message);
  }
}

async function generateUpcomingLessons() {
  try {
    const activeSchedules = await LessonSchedule.findAll({
      where: { status: 'active' },
    });

    for (const schedule of activeSchedules) {
      await lessonService.generateLessonInstances(schedule, 4);
    }
  } catch (error) {
    console.error('[Cron] Error generating upcoming lessons:', error.message);
  }
}

module.exports = {
  sendReminders,
  autoCompleteLessons,
  generateUpcomingLessons,
};
