const { Expo } = require('expo-server-sdk');
const { User } = require('../models');

const expo = new Expo();

const sendPushNotification = async (userId, { title, body, data }) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'pushToken'],
    });

    if (!user?.pushToken) return;

    if (!Expo.isExpoPushToken(user.pushToken)) {
      console.warn(`[Push] Invalid token for user ${userId}: ${user.pushToken}`);
      return;
    }

    const [ticket] = await expo.sendPushNotificationsAsync([
      {
        to: user.pushToken,
        sound: 'default',
        title,
        body,
        data: data || {},
      },
    ]);

    if (ticket.status === 'error') {
      console.error(`[Push] Error sending to user ${userId}:`, ticket.message);
    }
  } catch (error) {
    console.error(`[Push] Failed to send notification to user ${userId}:`, error.message);
  }
};

module.exports = { sendPushNotification };
