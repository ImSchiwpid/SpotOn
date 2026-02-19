import sgMail from '@sendgrid/mail';

// Send email using SendGrid
// Lazily set API key to avoid startup errors if credentials are missing
let sendgridAuthInvalid = false;

const getApiKey = () => {
  if (sendgridAuthInvalid) {
    return null;
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey || !apiKey.startsWith('SG.')) {
    console.warn('SendGrid API key is missing or invalid. Emails will be simulated.');
    return null;
  }
  return apiKey;
};

export const sendEmail = async (options) => {
  const apiKey = getApiKey();
  
  // If no valid API key, simulate email sending
  if (!apiKey) {
    console.log(`[SIMULATED EMAIL] To: ${options.to}`);
    console.log(`   Subject: ${options.subject}`);
    return { success: true, simulated: true };
  }
  
  try {
    sgMail.setApiKey(apiKey);
    const msg = {
      to: options.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@spoton.com',
        name: process.env.SENDGRID_FROM_NAME || 'SPOT-ON Parking'
      },
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${options.to}`);
    return { success: true };
  } catch (error) {
    const statusCode = error?.code || error?.response?.statusCode;
    if (statusCode === 401) {
      sendgridAuthInvalid = true;
      console.error('SendGrid authentication failed (401). Check SENDGRID_API_KEY. Falling back to simulated emails.');
      return { success: false, simulated: true, reason: 'sendgrid_unauthorized' };
    }

    console.error('SendGrid error:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    return { success: false, reason: 'sendgrid_send_failed' };
  }
};

// Booking confirmation email
export const sendBookingConfirmation = async (booking, user, parkingSpot) => {
  const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${parkingSpot.location.coordinates[1]},${parkingSpot.location.coordinates[0]}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
          <p>Your parking spot is reserved</p>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>Great news! Your parking reservation has been confirmed.</p>
          
          <div class="booking-details">
            <div class="detail-row">
              <span class="label">Booking ID:</span>
              <span class="value">${booking.bookingCode}</span>
            </div>
            <div class="detail-row">
              <span class="label">Parking Spot:</span>
              <span class="value">${parkingSpot.title}</span>
            </div>
            <div class="detail-row">
              <span class="label">Address:</span>
              <span class="value">${parkingSpot.address}, ${parkingSpot.city}</span>
            </div>
            <div class="detail-row">
              <span class="label">Start Time:</span>
              <span class="value">${new Date(booking.startTime).toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">End Time:</span>
              <span class="value">${new Date(booking.endTime).toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">${booking.hours} hour(s)</span>
            </div>
            <div class="detail-row">
              <span class="label">Total Amount:</span>
              <span class="value">₹${booking.totalAmount}</span>
            </div>
          </div>
          
          <p style="text-align: center;">
            <a href="${googleMapsLink}" class="button" target="_blank">📍 Get Directions</a>
          </p>
          
          <p><strong>Important:</strong> Please arrive on time and present your booking code if required.</p>
        </div>
        <div class="footer">
          <p>Thank you for using SPOT-ON Parking Platform</p>
          <p>If you have any questions, please contact us at support@spoton.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: `Booking Confirmed - ${booking.bookingCode}`,
    html: html
  });
};

// Cancellation email
export const sendCancellationEmail = async (booking, user, parkingSpot) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: #e74c3c; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>Your booking <strong>${booking.bookingCode}</strong> for ${parkingSpot.title} has been cancelled.</p>
          <p>If you were charged, a refund will be processed within 5-7 business days.</p>
        </div>
        <div class="footer">
          <p>Thank you for using SPOT-ON Parking Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: `Booking Cancelled - ${booking.bookingCode}`,
    html: html
  });
};

// Parking spot approval email
export const sendParkingApprovalEmail = async (user, parkingSpot) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Parking Spot Added!</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>Your parking spot <strong>${parkingSpot.title}</strong> has been successfully added to SPOT-ON!</p>
          <p>Location: ${parkingSpot.address}, ${parkingSpot.city}</p>
          <p>You'll start receiving bookings soon and earnings will be credited to your wallet.</p>
        </div>
        <div class="footer">
          <p>Thank you for being a part of SPOT-ON Parking Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Your Parking Spot is Now Live!',
    html: html
  });
};

export default sendEmail;


