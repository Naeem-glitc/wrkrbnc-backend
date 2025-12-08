import Client_schema from "../models/client_schema.js";
import bcrypt from "bcryptjs";
import otpStore from "../services/otpStore.js";
import crypto from 'crypto';
import { Resend } from 'resend';


// API function to create a new client

const createclient = async (req, resp) => {

    const body = { ...req.body };
    console.log('Received client signup request:', body);
    const { Name, Email, City, Address, Password } = body;
    if (!Name || !Email || !City || !Address || !Password) {
        return resp.status(400).json({ message: 'All fields are required', success: false });
    }

    try {
        const existingClient = await Client_schema.findOne({ Email });
        if (existingClient) {
            return resp.status(400).json({ message: 'Client already exists', success: false });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedPassword = await bcrypt.hash(Password, 10);
        otpStore.set(Email, {
            Name,
            Email,
            City,
            Address,
            otp,
            Password: hashedPassword,
            expires: Date.now() + 5 * 60 * 1000
        })

        // 4. DEBUG: Check environment variable
        console.log('Checking Resend API Key...');
        console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
        console.log('Resend_API exists:', !!process.env.Resend_API);
        console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('RESEND') || k.includes('RESEND')));

        // 5. Send verification email
        const resend = new Resend(process.env.RESEND_API_KEY || process.env.Resend_API); // Try both

        console.log('Attempting to send email to:', Email);

        const { data, error } = await resend.emails.send({
            from: 'WorkerBNC <onboarding@resend.dev>',
            to: Email,
            subject: 'Verify Your Email - WorkerBNC',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #4F46E5; padding: 20px; border-radius: 8px 8px 0 0; color: white;">
                        <h1 style="margin: 0;">WorkerBNC</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">Email Verification</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #111827; margin-top: 0;">Hello ${Name},</h2>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            Thank you for signing up with WorkerBNC! Please use the OTP below to verify your email address:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background-color: white; border: 2px dashed #4F46E5; 
                                        padding: 20px; border-radius: 8px; display: inline-block;">
                                <div style="font-size: 32px; font-weight: bold; color: #4F46E5; 
                                            letter-spacing: 5px;">
                                    ${otp}
                                </div>
                            </div>
                        </div>
                        
                        <p style="color: #6B7280; font-size: 14px;">
                            This OTP will expire in 5 minutes. If you didn't request this, please ignore this email.
                        </p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 12px;">
                                Need help? Contact us at support@workerbnc.com
                            </p>
                        </div>
                    </div>
                </div>
            `
        });

        // 6. Check if email was sent successfully
        if (error) {
            console.error('Resend API Error:', error);
            return resp.status(500).json({
                message: 'Failed to send verification email',
                success: false,
                error: error.message
            });
        }

        console.log('Email sent successfully! Email ID:', data?.id);

        // 7. Return success response
        resp.status(200).json({
            message: 'Signup successful! Please check your email for the OTP.',
            success: true,
            emailSent: true
        });


    } catch (error) {
        resp.status(500).json({ message: 'Internal server error', success: false });
    }

}


export default createclient;
