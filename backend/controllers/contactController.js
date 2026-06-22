import nodemailer from "nodemailer";

const isValidEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone = "", subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject and message are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email service is not configured on server",
      });
    }

    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send message to receiver
    await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: receiverEmail,
      replyTo: email,
      subject: `New Contact Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 680px; margin: auto;">
          <h2 style="margin-bottom: 12px;">New message from your website contact form</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="white-space: pre-wrap; border: 1px solid #ddd; border-radius: 8px; padding: 12px;">${message}</div>
        </div>
      `,
    });
    console.log(`✅ Message received from ${name} (${email})`);

    // Send auto-reply to the sender
    await transporter.sendMail({
      from: `"Dolce Vita" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank You for Reaching Out to Us!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <div style="background-color: #d63384; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; letter-spacing: 3px; font-size: 28px;">DOLCE VITA</h1>
          </div>
          
          <div style="padding: 40px; line-height: 1.8; color: #444;">
            <h2 style="color: #333;">Hello, ${name}!</h2>
            <p>Thank you for reaching out to us! 😊</p>
            
            <p>We have received your message with the subject <strong>"${subject}"</strong> and will get back to you as soon as possible.</p>
            
            <div style="background-color: #fff4f8; padding: 25px; border-radius: 10px; border: 2px dashed #d63384; margin: 30px 0;">
              <p style="margin: 0; font-weight: bold; color: #d63384; font-size: 14px;">YOUR MESSAGE DETAILS</p>
              <p style="margin: 12px 0 0 0; font-size: 13px;"><strong>Sent on:</strong> ${new Date().toLocaleDateString()}</p>
              <p style="margin: 8px 0 0 0; font-size: 13px;"><strong>Subject:</strong> ${subject}</p>
            </div>

            <p>We appreciate your interest in Dolce Vita. Our team will review your message and respond within 24-48 hours.</p>
            
            <p style="margin-top: 40px;">Best regards,<br><strong style="color: #d63384;">The Dolce Vita Team</strong></p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
            <p>Handcrafted with Love | Dolce Vita Roadside Stall</p>
          </div>
        </div>
      `,
    });
    console.log(`✅ Auto-reply sent to ${email}`);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully and auto-reply has been sent to your email",
    });
  } catch (error) {
    console.error("Contact email error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};
