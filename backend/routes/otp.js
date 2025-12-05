import express from 'express';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Store for OTP verification (in production, use Redis)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Lazy transporter - only created when needed
let transporter = null;

// Log email config status on startup (without exposing secrets)
console.log('Email config:', {
    EMAIL_USER: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.slice(0, 5)}...` : 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.length} chars` : 'NOT SET'
});

// Create email transporter (lazy initialization)
const getTransporter = () => {
    if (transporter) return transporter;

    try {
        // Check for custom SMTP config
        if (process.env.SMTP_HOST) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            // Use Gmail
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        }
        return transporter;
    } catch (error) {
        console.error('Failed to create email transporter:', error.message);
        return null;
    }
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
    const emailTransporter = getTransporter();

    if (!emailTransporter) {
        throw new Error('Email not configured');
    }

    const mailOptions = {
        from: `"Ascension" <${process.env.EMAIL_USER || 'noreply@ascension.app'}>`,
        to: email,
        subject: 'Your Ascension Login Code',
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #8b5cf6, #d946ef); border-radius: 12px; transform: rotate(45deg); margin: 0 auto 15px;"></div>
                    <h1 style="color: #18181b; font-size: 24px; margin: 0;">ASCENSION</h1>
                </div>
                <p style="color: #52525b; font-size: 16px; margin-bottom: 25px;">
                    Your verification code is:
                </p>
                <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8b5cf6; font-family: monospace;">
                        ${otp}
                    </span>
                </div>
                <p style="color: #71717a; font-size: 14px; margin-bottom: 10px;">
                    This code expires in 5 minutes.
                </p>
                <p style="color: #a1a1aa; font-size: 12px;">
                    If you didn't request this code, you can safely ignore this email.
                </p>
            </div>
        `
    };

    await emailTransporter.sendMail(mailOptions);
};

// @route   POST /api/otp/send
// @desc    Send OTP to email
// @access  Public
router.post('/send', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const otp = generateOTP();

        // Store OTP with 5 minute expiry
        otpStore.set(normalizedEmail, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
            attempts: 0
        });

        // Try to send email, fallback to console if it fails
        let emailSent = false;
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                await sendOTPEmail(normalizedEmail, otp);
                emailSent = true;
            } catch (emailError) {
                console.error('Email send failed:', emailError.message);
                console.log(`\n📧 OTP for ${normalizedEmail}: ${otp} (email failed, logged here)\n`);
            }
        } else {
            // Development mode - log OTP to console
            console.log(`\n📧 OTP for ${normalizedEmail}: ${otp}\n`);
        }

        res.json({
            message: emailSent ? 'OTP sent successfully' : 'OTP generated (check server logs)',
            email: normalizedEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
});

// @route   POST /api/otp/verify
// @desc    Verify OTP and login/register user
// @access  Public
router.post('/verify', async (req, res) => {
    try {
        const { email, otp, name } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const storedData = otpStore.get(normalizedEmail);

        if (!storedData) {
            return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
        }

        // Check expiry
        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(normalizedEmail);
            return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
        }

        // Check attempts
        if (storedData.attempts >= 3) {
            otpStore.delete(normalizedEmail);
            return res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
        }

        // Verify OTP
        if (storedData.otp !== otp) {
            storedData.attempts++;
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Clear OTP after successful verification
        otpStore.delete(normalizedEmail);

        // Find or create user
        let user = await User.findOne({ email: normalizedEmail });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            user = await User.create({
                email: normalizedEmail,
                name: name || 'Champion'
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.json({
            message: isNewUser ? 'Account created successfully' : 'Login successful',
            user: user.toJSON(),
            token,
            isNewUser
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Verification failed. Please try again.' });
    }
});

export default router;
