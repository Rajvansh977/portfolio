import express from 'express';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

const router = express.Router();

// ── Rate limiter: max 5 messages per IP per hour ─────────────
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many messages sent. Please try again later.' },
});

// ── MongoDB schema ───────────────────────────────────────────
const messageSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true, maxlength: 100 },
    email:   { type: String, required: true, trim: true, maxlength: 200 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    ip:      { type: String },
  },
  { timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

// ── Nodemailer transporter ───────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,   // Gmail App Password
  },
});

// ── POST /api/contact ────────────────────────────────────────
router.post('/', limiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    // 1. Save to MongoDB
    await Message.create({
      name:    name.slice(0, 100),
      email:   email.slice(0, 200),
      subject: subject.slice(0, 200),
      message: message.slice(0, 2000),
      ip:      req.ip,
    });

    // 2. Send email notification to you
    await transporter.sendMail({
      from:    `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to:      process.env.EMAIL_TO,
      subject: `[Portfolio] ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a1628;color:#e8f4f8;padding:30px;border-radius:10px;">
          <h2 style="color:#f4d03f;border-bottom:2px solid #f4d03f;padding-bottom:10px;">📬 New Portfolio Message</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;color:#f4d03f;font-weight:bold;width:100px;">From:</td><td style="padding:10px 0;">${name}</td></tr>
            <tr><td style="padding:10px 0;color:#f4d03f;font-weight:bold;">Email:</td><td style="padding:10px 0;"><a href="mailto:${email}" style="color:#e8f4f8;">${email}</a></td></tr>
            <tr><td style="padding:10px 0;color:#f4d03f;font-weight:bold;">Subject:</td><td style="padding:10px 0;">${subject}</td></tr>
          </table>
          <div style="background:#132039;border-left:4px solid #f4d03f;padding:20px;margin-top:20px;border-radius:5px;">
            <p style="margin:0;line-height:1.8;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="color:#666;font-size:12px;margin-top:20px;">Sent from your portfolio contact form.</p>
        </div>
      `,
    });

    // 3. Send auto-reply to sender
    await transporter.sendMail({
      from:    `"Rajvansh Rana" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `Thanks for reaching out, ${name}!`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a1628;color:#e8f4f8;padding:30px;border-radius:10px;">
          <h2 style="color:#f4d03f;">Hey ${name}! 👋</h2>
          <p style="line-height:1.8;">Thanks for reaching out. I've received your message and will get back to you as soon as possible.</p>
          <div style="background:#132039;border-left:4px solid #f4d03f;padding:20px;margin:20px 0;border-radius:5px;">
            <p style="margin:0;color:#f4d03f;font-weight:bold;">Your message:</p>
            <p style="margin:10px 0 0;line-height:1.8;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="line-height:1.8;">In the meantime, feel free to check out my work on <a href="https://github.com/rajvansh977" style="color:#f4d03f;">GitHub</a> or connect on <a href="https://www.linkedin.com/in/rajvansh-rana-6b98521b4/" style="color:#f4d03f;">LinkedIn</a>.</p>
          <p style="color:#f4d03f;font-weight:bold;">— Rajvansh Rana</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'Message sent successfully!' });

  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

export default router;
