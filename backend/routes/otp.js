import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Store for OTP verification (in production, use Redis)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email with timeout
const sendOTPEmail = async (email, otp) => {
    // Skip if no email credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`📧 OTP for ${email}: ${otp} (email not configured)`);
        return false;
    }

    try {
        // Dynamic import with timeout
        const nodemailer = await import('nodemailer');

        const transporter = nodemailer.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            connectionTimeout: 10000, // 10 second timeout
            greetingTimeout: 5000
        });

        const mailOptions = {
            from: `"Ascension" <${process.env.EMAIL_USER}>`,
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

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email send failed:', error.message);
        console.log(`📧 OTP for ${email}: ${otp} (email failed, check logs)`);
        return false;
    }
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

        // Log OTP for debugging
        console.log(`📧 Generated OTP for ${normalizedEmail}: ${otp}`);

        // Try to send email (don't wait too long)
        const emailSent = await sendOTPEmail(normalizedEmail, otp);

        res.json({
            message: emailSent ? 'OTP sent to your email' : 'OTP generated - check server logs',
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
    console.log('📧 OTP VERIFY REQUEST:', req.body.email);
    try {
        const { email, otp, name } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const storedData = otpStore.get(normalizedEmail);

        if (!storedData) {
            console.log('❌ OTP expired/not found for:', normalizedEmail);
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
            console.log('❌ Invalid OTP attempt for:', normalizedEmail);
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Clear OTP after successful verification
        otpStore.delete(normalizedEmail);

        // Find or create user
        let user = await User.findOne({ email: normalizedEmail });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            console.log('🆕 Creating new user:', normalizedEmail);
            user = await User.create({
                email: normalizedEmail,
                name: name || 'Champion'
            });
        } else {
            console.log('✅ Found existing user:', normalizedEmail, 'workouts:', user.workouts?.length || 0);
        }

        // Generate JWT token
        const token = generateToken(user._id);

        console.log('✅ OTP VERIFY SUCCESS for:', normalizedEmail, 'returning workouts:', user.workouts?.length || 0);

        res.json({
            message: isNewUser ? 'Account created successfully' : 'Login successful',
            user: user.toJSON(),
            token,
            isNewUser
        });

    } catch (error) {
        console.error('❌ Verify OTP error:', error);
        res.status(500).json({ message: 'Verification failed. Please try again.' });
    }
});

export default router;
