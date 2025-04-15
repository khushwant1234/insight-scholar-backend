import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    // Create a transporter using the exact same configuration that worked in your test
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Define email options with improved headers to reduce spam classification
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      // Add important headers to improve deliverability
      headers: {
        'Priority': 'High',
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      },
      // Add message ID with sender domain to improve deliverability
      messageId: `<${Date.now()}.${Math.random().toString().slice(2)}@${process.env.EMAIL_DOMAIN || 'insightscholar.com'}>`,
      // Add list-unsubscribe header (important for deliverability)
      list: {
        unsubscribe: {
          url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe`,
          comment: 'Unsubscribe from InsightScholar emails'
        }
      }
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default sendEmail;