const cron = require('node-cron');
const {
  sendReminders,
  autoCompleteLessons,
  generateUpcomingLessons,
} = require('./lessonCron');

function startCronJobs() {
  // Every 15 minutes: send lesson reminders
  cron.schedule('*/15 * * * *', sendReminders);

  // Every hour: auto-complete past lessons
  cron.schedule('0 * * * *', autoCompleteLessons);

  // Daily at 2am: generate upcoming lesson instances
  cron.schedule('0 2 * * *', generateUpcomingLessons);

  console.log('⏰ Cron jobs started (reminders, auto-complete, lesson generation)');
}

module.exports = { startCronJobs };
