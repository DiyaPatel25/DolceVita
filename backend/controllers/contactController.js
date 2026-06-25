import nodemailer from "nodemailer";
import DataAccess from "../config/dataAccess.js";

const contactDB = new DataAccess('Contact');

const isValidEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const escapeHtml = (unsafe) => {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

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

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    // Save inquiry to storage securely
    await contactDB.create({
      name: safeName,
      email: safeEmail,
      phone: safePhone,
      subject: safeSubject,
      message: safeMessage,
      createdAt: new Date()
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ EMAIL_USER or EMAIL_PASS not set in environment. Inquiry saved to DB, skipping email dispatch.");
      return res.status(200).json({
        success: true,
        message: "Request received! We will contact you shortly.",
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

    try {
      // Send message to receiver
      await transporter.sendMail({
        from: `"Website Contact" <${process.env.EMAIL_USER}>`,
        to: receiverEmail,
        replyTo: email,
        subject: `New Contact Message: ${safeSubject}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 680px; margin: auto;">
            <h2 style="margin-bottom: 12px;">New message from your website contact form</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Phone:</strong> ${safePhone || "Not provided"}</p>
            <p><strong>Subject:</strong> ${safeSubject}</p>
            <p><strong>Message:</strong></p>
            <div style="white-space: pre-wrap; border: 1px solid #ddd; border-radius: 8px; padding: 12px;">${safeMessage}</div>
          </div>
        `,
      });
      console.log(`✅ Message received from ${safeName} (${safeEmail})`);

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
            
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
              <p>Handcrafted with Love | Dolce Vita Roadside Stall</p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Auto-reply sent to ${email}`);
    } catch (emailErr) {
      console.warn("⚠️ Nodemailer email dispatch encountered an error (e.g. invalid Gmail pass):", emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact email error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};
