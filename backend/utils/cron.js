const cron = require('node-cron');
const mongoose = require('mongoose');
const bookingController = require("../controllers/bookingController");
const healthController = require("../controllers/healthController");
const User = require("../models/User");
const moment = require('moment-timezone');

// Configure with your timezone
const TIMEZONE = 'Asia/Jerusalem'; // For Jerusalem time
// Schedule to run at the start of every minute
cron.schedule('0 * * * * *', async () => {
  try {
    const startTime = moment().tz(TIMEZONE);
    console.log(`\n--- Starting cron job at ${startTime.format('YYYY-MM-DD HH:mm:ss')} ---`);

    const result = await bookingController.updatePastBookingsCron();
    
    const endTime = moment().tz(TIMEZONE);
    const duration = endTime.diff(startTime, 'seconds');
    
    console.log(`Result: ${result.message}`);
    console.log(`--- Completed in ${duration} seconds ---\n`);
    
  } catch (error) {
    console.error('Cron job failed:', error);
    console.log('--- Cron job failed ---\n');
  }
}, {
  scheduled: true,
  timezone: TIMEZONE
});

// Cancellation Stats Reset - Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  const startTime = moment().tz(TIMEZONE);
  console.log(`\n[CRON] Starting cancellation stats reset at ${startTime.format('YYYY-MM-DD HH:mm:ss')}`);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const sevenDaysAgo = moment().subtract(7, 'days').toDate();
      
      const result = await User.updateMany(
        {
          'cancellationStats.lastCancellation': { $lt: sevenDaysAgo }
        },
        {
          $set: {
            'cancellationStats.countLast7Days': 0,
            'cancellationStats.warnings': 0
          }
        }
      ).session(session);

      console.log(`[CRON] Reset cancellation stats for ${result.modifiedCount} users`);
    });
  } catch (error) {
    console.error('[CRON] Cancellation stats reset failed:', error);
  } finally {
    session.endSession();
  }

  const duration = moment().tz(TIMEZONE).diff(startTime, 'seconds');
  console.log(`[CRON] Cancellation stats reset completed in ${duration}s`);
}, {
  scheduled: true,
  timezone: TIMEZONE
});

//  Health Check Logging - Run every 5 minutes
// cron.schedule('*/5 * * * *', async () => {
  
  // Health Check Logging - Run every hour
  cron.schedule('0 * * * *', async () => {
    const startTime = moment().tz(TIMEZONE);
    console.log(`\n[CRON] Starting health check at ${startTime.format('YYYY-MM-DD HH:mm:ss')}`);
  
    try {
      await healthController.logStatus();
      const duration = moment().tz(TIMEZONE).diff(startTime, 'seconds');
      console.log(`[CRON] Health check logged in ${duration}s`);
    } catch (error) {
      console.error('[CRON] Health check logging failed:', error);
    }
  }, {
    scheduled: true,
    timezone: TIMEZONE
  });
  

console.log(`Cron job scheduler started for timezone: ${TIMEZONE}`);