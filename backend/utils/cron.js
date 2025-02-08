const cron = require('node-cron');
const bookingController = require("../controllers/bookingController");
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

console.log(`Cron job scheduler started for timezone: ${TIMEZONE}`);