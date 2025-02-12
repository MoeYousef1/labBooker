const cron = require('node-cron');
const bookingController = require("../controllers/bookingController");
const healthController = require("../controllers/healthController");
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

// 2. Health Check Logging - Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
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