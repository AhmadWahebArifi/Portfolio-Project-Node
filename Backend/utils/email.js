const nodemailer = require("nodemailer");

// Create reusable transporter object using the default SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
const sendEmail = async (options) => {
  const transporter = createTransporter();

  const message = {
    from: `${options.name || "Portfolio"} <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log("Email sent: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Email could not be sent");
  }
};

// Send contact form notification to admin
const sendContactNotification = async (contactData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Contact Form Submission</h2>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Phone:</strong> ${contactData.phone || "Not provided"}</p>
        <p><strong>Company:</strong> ${
          contactData.company || "Not provided"
        }</p>
        <p><strong>Subject:</strong> ${contactData.subject}</p>
        <div style="margin-top: 20px;">
          <p><strong>Message:</strong></p>
          <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff;">
            ${contactData.message.replace(/\n/g, "<br>")}
          </div>
        </div>
      </div>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        This email was automatically generated from your portfolio contact form.
      </p>
    </div>
  `;

  const options = {
    email: process.env.EMAIL_FROM,
    subject: `New Contact: ${contactData.subject}`,
    message: `
      New contact form submission:
      
      Name: ${contactData.name}
      Email: ${contactData.email}
      Phone: ${contactData.phone || "Not provided"}
      Company: ${contactData.company || "Not provided"}
      Subject: ${contactData.subject}
      
      Message:
      ${contactData.message}
    `,
    html,
  };

  return await sendEmail(options);
};

// Send auto-reply to contact form submitter
const sendContactAutoReply = async (contactData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Thank you for contacting me!</h2>
      <p>Hi ${contactData.name},</p>
      <p>Thank you for reaching out through my portfolio website. I have received your message and will get back to you as soon as possible.</p>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your Message Summary:</h3>
        <p><strong>Subject:</strong> ${contactData.subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff;">
          ${contactData.message.replace(/\n/g, "<br>")}
        </div>
      </div>
      
      <p>I typically respond within 24-48 hours. If your inquiry is urgent, please feel free to reach out to me directly.</p>
      
      <p>Best regards,<br>Your Name</p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated response. Please do not reply to this email.
      </p>
    </div>
  `;

  const options = {
    email: contactData.email,
    subject: `Re: ${contactData.subject} - Thank you for contacting me`,
    message: `
      Hi ${contactData.name},
      
      Thank you for reaching out through my portfolio website. I have received your message about "${contactData.subject}" and will get back to you as soon as possible.
      
      I typically respond within 24-48 hours.
      
      Best regards,
      Your Name
    `,
    html,
  };

  return await sendEmail(options);
};

module.exports = {
  sendEmail,
  sendContactNotification,
  sendContactAutoReply,
};
